import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard, type AuthenticatedUser } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ChatService } from './chat.service';
import { ChatReplyRequestSchema, type ChatReplyDto } from './dto/chat-reply.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('reply')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message and get AI reply' })
  @ApiResponse({ status: 200, description: 'Reply generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized — invalid or expired token' })
  @ApiResponse({ status: 400, description: 'Validation error — invalid body' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 502, description: 'OpenAI failed' })
  async reply(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(ChatReplyRequestSchema)) dto: ChatReplyDto,
  ) {
    return this.chatService.generateReply(user.uid, dto.message);
  }
}
