import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ContextService } from './services/context.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ContextService],
})
export class ChatModule {}
