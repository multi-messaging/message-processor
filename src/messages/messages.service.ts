import { Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesRepository } from './repositories';
import { MessagesAttachmentsRepository } from './repositories/message-attachments.repository';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessagesRepository,
    private readonly attachmentRepository: MessagesAttachmentsRepository,
    private readonly conversationsService: ConversationsService,
  ) {}

  /**
   * Crear un nuevo mensaje
   */
  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    // Verificar que la conversación existe
    const conversation = await this.conversationsService.findOne(
      createMessageDto.conversationId,
    );
    if (!conversation) {
      throw new NotFoundException(
        `Conversación con ID ${createMessageDto.conversationId} no encontrada`,
      );
    }

    // Crear el mensaje
    const message = this.messageRepository.create({
      ...createMessageDto,
      conversation,
    });

    // Guardar el mensaje
    const savedMessage = await this.messageRepository.save(message);

    // Si hay attachments, crearlos
    if (
      createMessageDto.attachments &&
      createMessageDto.attachments.length > 0
    ) {
      const attachments = createMessageDto.attachments.map((attachmentDto) =>
        this.attachmentRepository.create({
          ...attachmentDto,
          message: savedMessage,
        }),
      );

      savedMessage.attachments =
        await this.attachmentRepository.save(attachments);
    }

    return savedMessage;
  }

  /**
   * Obtener todos los mensajes con filtros y paginación
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    conversationId?: string;
    direction?: 'incoming' | 'outgoing';
    type?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    channel?: string;
  }): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      conversationId,
      direction,
      type,
      search,
      dateFrom,
      dateTo,
      channel,
    } = options || {};

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .leftJoinAndSelect('message.conversation', 'conversation')
      .orderBy('message.createdAt', 'DESC');

    // Aplicar filtros
    if (conversationId) {
      queryBuilder.andWhere('message.conversation.id = :conversationId', {
        conversationId,
      });
    }

    if (direction) {
      queryBuilder.andWhere('message.direction = :direction', { direction });
    }

    if (type) {
      queryBuilder.andWhere('message.type = :type', { type });
    }

    // Cambio principal: usar LIKE en lugar de ILIKE para MySQL
    if (search) {
      queryBuilder.andWhere('LOWER(message.content) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere('message.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
      });
    }

    if (channel) {
      queryBuilder.andWhere('conversation.channel = :channel', { channel });
    }

    // Paginación
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un mensaje por ID
   */
  async findOne(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['attachments', 'conversation'],
    });

    if (!message) {
      throw new NotFoundException(`Mensaje con ID ${id} no encontrado`);
    }

    return message;
  }

  /**
   * Obtener mensajes de una conversación específica
   */
  async findByConversation(
    conversationId: string,
    options?: {
      page?: number;
      limit?: number;
      direction?: 'incoming' | 'outgoing';
    },
  ): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50, direction } = options || {};

    // Verificar que la conversación existe
    await this.conversationsService.findOne(conversationId);

    const queryOptions: FindManyOptions<Message> = {
      where: {
        conversation: { id: conversationId },
        ...(direction && { direction }),
      },
      relations: ['attachments'],
      order: { createdAt: 'ASC' }, // Orden cronológico para conversaciones
      skip: (page - 1) * limit,
      take: limit,
    };

    const [messages, total] =
      await this.messageRepository.findAndCount(queryOptions);

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Actualizar un mensaje
   */
  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const message = await this.findOne(id);

    // Solo permitir actualizar ciertos campos (por ejemplo, metadata)
    const allowedFields = ['content', 'metadata'];
    const updateData = {};

    Object.keys(updateMessageDto).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = updateMessageDto[key];
      }
    });

    Object.assign(message, updateData);

    return await this.messageRepository.save(message);
  }

  /**
   * Eliminar un mensaje
   */
  async remove(id: string): Promise<void> {
    const message = await this.findOne(id);
    await this.messageRepository.remove(message);
  }

  /**
   * Buscar mensajes por contenido (corregido para MySQL)
   */
  async search(
    searchTerm: string,
    options?: {
      page?: number;
      limit?: number;
      conversationId?: string;
      channel?: string;
    },
  ): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, conversationId, channel } = options || {};

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .leftJoinAndSelect('message.conversation', 'conversation')
      // Cambio principal: usar LOWER() con LIKE en lugar de ILIKE
      .where('LOWER(message.content) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('message.createdAt', 'DESC');

    if (conversationId) {
      queryBuilder.andWhere('message.conversation.id = :conversationId', {
        conversationId,
      });
    }

    if (channel) {
      queryBuilder.andWhere('conversation.channel = :channel', { channel });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener estadísticas de mensajes
   */
  async getStats(options?: {
    dateFrom?: string;
    dateTo?: string;
    conversationId?: string;
    channel?: string;
  }): Promise<{
    total: number;
    incoming: number;
    outgoing: number;
    byType: Record<string, number>;
    byChannel: Record<string, number>;
    byDate: Array<{ date: string; count: number }>;
  }> {
    const { dateFrom, dateTo, conversationId, channel } = options || {};

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.conversation', 'conversation');

    // Aplicar filtros de fecha
    if (dateFrom && dateTo) {
      queryBuilder.andWhere('message.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
      });
    }

    if (conversationId) {
      queryBuilder.andWhere('message.conversation.id = :conversationId', {
        conversationId,
      });
    }

    if (channel) {
      queryBuilder.andWhere('conversation.channel = :channel', { channel });
    }

    // Estadísticas básicas
    const [total, incoming, outgoing] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .clone()
        .andWhere('message.direction = :direction', { direction: 'incoming' })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('message.direction = :direction', { direction: 'outgoing' })
        .getCount(),
    ]);

    // Estadísticas por tipo
    const typeStats = await queryBuilder
      .clone()
      .select('message.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.type')
      .getRawMany();

    const byType = typeStats.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {});

    // Estadísticas por canal
    const channelStats = await queryBuilder
      .clone()
      .select('conversation.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('conversation.channel')
      .getRawMany();

    const byChannel = channelStats.reduce((acc, item) => {
      acc[item.channel] = parseInt(item.count);
      return acc;
    }, {});

    // Estadísticas por fecha (últimos 7 días) - corregido para MySQL
    const dateStats = await queryBuilder
      .clone()
      .select('DATE(message.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('message.createdAt >= :weekAgo', {
        weekAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      })
      .groupBy('DATE(message.createdAt)')
      .orderBy('DATE(message.createdAt)', 'ASC')
      .getRawMany();

    const byDate = dateStats.map((item) => ({
      date: item.date,
      count: parseInt(item.count),
    }));

    return {
      total,
      incoming,
      outgoing,
      byType,
      byChannel,
      byDate,
    };
  }

  /**
   * Marcar mensajes como leídos (útil para futuras implementaciones)
   */
  async markAsRead(_conversationId: string): Promise<void> {
    // Esta funcionalidad se puede implementar agregando un campo 'read' a la entidad Message
    // Por ahora es un placeholder
  }
}
