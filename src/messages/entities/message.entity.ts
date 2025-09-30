import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from '../../conversations/entities';
import { MessageAttachment } from '.';
type Direction = 'incoming' | 'outgoing';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['incoming', 'outgoing'] })
  direction: Direction;

  @Column({
    type: 'enum',
    enum: ['text', 'image', 'video', 'audio', 'file', 'interactive'],
  })
  type: string;

  @Column('text', { nullable: true })
  content: string;

  @Column('json', { nullable: true })
  metadata: {
    header?: { type: string; content: string };
    body?: { text: string };
    footer?: { text: string };
    components?: any[];
  };

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @OneToMany(() => MessageAttachment, (attachment) => attachment.message, {
    cascade: true,
  })
  attachments: MessageAttachment[];
}
