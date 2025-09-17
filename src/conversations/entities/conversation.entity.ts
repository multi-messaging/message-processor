import { Message } from 'src/messages/entities';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column()
  channel: string;

  @Column({ default: 'active' })
  status: 'active' | 'closed' | 'pending';

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
  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  messages: Message[];
}
