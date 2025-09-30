import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message, MessageAttachment } from './entities';
import { MessagesRepository } from './repositories';
import { MessagesAttachmentsRepository } from './repositories/message-attachments.repository';
import { ConversationsModule } from 'src/conversations/conversations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageAttachment]),
    ConversationsModule,
  ],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesRepository,
    MessagesAttachmentsRepository,
  ],
  exports: [MessagesService, MessagesRepository, MessagesAttachmentsRepository],
})
export class MessagesModule {}
