import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MessageAttachment } from '../entities';

@Injectable()
export class MessagesAttachmentsRepository extends Repository<MessageAttachment> {
  constructor(private readonly dataSource: DataSource) {
    super(MessageAttachment, dataSource.createEntityManager());
  }
}
