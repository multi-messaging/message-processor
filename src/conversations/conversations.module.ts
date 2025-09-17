import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities';
import { ConversationRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation])],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationRepository],
  exports: [ConversationsService, ConversationRepository],
})
export class ConversationsModule {}
