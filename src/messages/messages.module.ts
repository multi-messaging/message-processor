import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message, MessageAttachment } from './entities';
import { MessagesRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessageAttachment])],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService, MessagesRepository],
})
export class MessagesModule {}
