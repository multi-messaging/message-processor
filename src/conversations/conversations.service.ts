import { Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Conversation } from './entities/conversation.entity';
import { ConversationRepository } from './repositories';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
  ) {}

  /**
   * Crear una nueva conversación
   */
  async create(
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const conversation = this.conversationRepository.create(
      createConversationDto,
    );
    return await this.conversationRepository.save(conversation);
  }

  /**
   * Obtener todas las conversaciones con paginación y filtros
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    status?: string;
    channel?: string;
    customerId?: string;
  }): Promise<{
    conversations: Conversation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, status, channel, customerId } = options || {};

    const queryOptions: FindManyOptions<Conversation> = {
      relations: ['messages'],
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    // Agregar filtros dinámicamente
    const where: any = {};
    if (status) where.status = status;
    if (channel) where.channel = channel;
    if (customerId) where.customerId = customerId;

    if (Object.keys(where).length > 0) {
      queryOptions.where = where;
    }

    const [conversations, total] =
      await this.conversationRepository.findAndCount(queryOptions);

    return {
      conversations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener una conversación por ID
   */
  async findOne(id: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['messages', 'messages.attachments'],
      order: {
        messages: { createdAt: 'ASC' },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversación con ID ${id} no encontrada`);
    }

    return conversation;
  }

  /**
   * Buscar conversación por customer ID y canal
   */
  async findByCustomerAndChannel(
    customerId: string,
    channel: string,
  ): Promise<Conversation | null> {
    return await this.conversationRepository.findOne({
      where: {
        customerId,
        channel,
        status: 'active', // Solo conversaciones activas
      },
      relations: ['messages'],
      order: {
        messages: { createdAt: 'ASC' },
      },
    });
  }

  /**
   * Obtener o crear una conversación (útil para cuando llega un mensaje)
   */
  async findOrCreate(
    customerId: string,
    channel: string,
  ): Promise<Conversation> {
    let conversation = await this.findByCustomerAndChannel(customerId, channel);

    if (!conversation) {
      conversation = await this.create({
        customerId,
        channel,
        status: 'active',
      });
    }

    return conversation;
  }

  /**
   * Actualizar una conversación
   */
  async update(
    id: string,
    updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.findOne(id);

    Object.assign(conversation, updateConversationDto);

    return await this.conversationRepository.save(conversation);
  }

  /**
   * Cerrar una conversación
   */
  async close(id: string): Promise<Conversation> {
    return await this.update(id, { status: 'closed' });
  }

  /**
   * Reactivar una conversación
   */
  async reactivate(id: string): Promise<Conversation> {
    return await this.update(id, { status: 'active' });
  }

  /**
   * Eliminar una conversación (soft delete cambiando status)
   */
  async remove(id: string): Promise<void> {
    const conversation = await this.findOne(id);
    await this.conversationRepository.remove(conversation);
  }

  /**
   * Obtener estadísticas de conversaciones
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    closed: number;
    pending: number;
    byChannel: Record<string, number>;
  }> {
    const [total, active, closed, pending] = await Promise.all([
      this.conversationRepository.count(),
      this.conversationRepository.count({ where: { status: 'active' } }),
      this.conversationRepository.count({ where: { status: 'closed' } }),
      this.conversationRepository.count({ where: { status: 'pending' } }),
    ]);

    // Obtener estadísticas por canal
    const channelStats = await this.conversationRepository
      .createQueryBuilder('conversation')
      .select('conversation.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('conversation.channel')
      .getRawMany();

    const byChannel = channelStats.reduce((acc, item) => {
      acc[item.channel] = parseInt(item.count);
      return acc;
    }, {});

    return {
      total,
      active,
      closed,
      pending,
      byChannel,
    };
  }
}
