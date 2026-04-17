import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PinoLogger } from 'nestjs-pino';
import {
  WriteMessageSchema,
  type MessageRole,
  type WriteMessageInput,
} from '@fidooo/shared';

const StoredMessageSchema = WriteMessageSchema.pick({
  role: true,
  content: true,
});

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore!: admin.firestore.Firestore;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {}

  onModuleInit(): void {
    if (!admin.apps.length) {
      const projectId = this.config.getOrThrow<string>('FIREBASE_PROJECT_ID');
      const usesEmulator =
        Boolean(this.config.get<string>('FIRESTORE_EMULATOR_HOST')) ||
        Boolean(this.config.get<string>('FIREBASE_AUTH_EMULATOR_HOST'));

      if (usesEmulator) {
        admin.initializeApp({ projectId });
      } else {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail: this.config.getOrThrow<string>('FIREBASE_CLIENT_EMAIL'),
            privateKey: this.config
              .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
              .replace(/\\n/g, '\n'),
          }),
        });
      }
    }
    this.firestore = admin.firestore();
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return admin.auth().verifyIdToken(token);
  }

  /**
   * Trivial read used by readiness probes. Hits a non-existent document so it
   * never writes, never iterates a collection, and stays well within the free
   * tier — yet still exercises auth, network and Firestore round-trip.
   */
  async ping(): Promise<void> {
    await this.firestore.collection('_health').doc('probe').get();
  }

  async getRecentMessages(
    uid: string,
    messageLimit: number,
  ): Promise<Array<{ role: MessageRole; content: string }>> {
    const snapshot = await this.firestore
      .collection('chats')
      .doc(uid)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(messageLimit)
      .get();

    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const parsed = StoredMessageSchema.safeParse({
          role: data['role'],
          content: data['content'],
        });
        if (!parsed.success) {
          this.logger.warn(
            { docId: doc.id, errors: parsed.error.flatten() },
            'Invalid message document, skipping',
          );
          return null;
        }
        return parsed.data;
      })
      .filter(
        (msg): msg is { role: MessageRole; content: string } => msg !== null,
      )
      .reverse();
  }

  async writeMessage(input: WriteMessageInput): Promise<string> {
    const parsed = WriteMessageSchema.parse(input);
    const ref = await this.firestore
      .collection('chats')
      .doc(parsed.uid)
      .collection('messages')
      .add({
        role: parsed.role,
        content: parsed.content,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        uid: parsed.uid,
      });
    return ref.id;
  }

  async writeUserMessage(uid: string, content: string): Promise<string> {
    return this.writeMessage({ uid, role: 'user', content });
  }

  async writeAssistantMessage(uid: string, content: string): Promise<string> {
    return this.writeMessage({ uid, role: 'assistant', content });
  }

  /**
   * Best-effort delete used to roll back a message that was persisted before
   * a downstream failure (e.g. OpenAI). Failures are logged but never thrown
   * so the original error keeps propagating.
   */
  async deleteMessage(uid: string, messageId: string): Promise<void> {
    try {
      await this.firestore
        .collection('chats')
        .doc(uid)
        .collection('messages')
        .doc(messageId)
        .delete();
    } catch (error) {
      this.logger.warn(
        { uid, messageId, error },
        'Failed to roll back message',
      );
    }
  }
}
