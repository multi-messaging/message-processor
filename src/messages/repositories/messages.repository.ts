import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Message } from '../entities';

@Injectable()
export class MessagesRepository extends Repository<Message> {
  constructor(private readonly dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }
}
