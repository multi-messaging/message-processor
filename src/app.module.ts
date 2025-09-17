import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './db';
import { MessagesModule } from './messages/messages.module';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
  imports: [
    DBModule,
    MessagesModule,
    ConversationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
