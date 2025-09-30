import { Controller, Logger } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import {
  QueryMessagesDto,
  SearchMessagesDto,
  StatsMessagesDto,
} from './dto/query-messages.dto';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ConversationsService } from 'src/conversations/conversations.service';

@Controller()
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
  ) {}

  /**
   * Crear un nuevo mensaje
   * Pattern: message-processor.create.message
   */
  @MessagePattern('message-processor.create.message')
  async create(@Payload() createMessageDto: CreateMessageDto) {
    this.logger.log(
      `Creando nuevo mensaje para conversación: ${createMessageDto.conversationId}`,
    );

    try {
      const message = await this.messagesService.create(createMessageDto);
      return {
        success: true,
        data: message,
        message: 'Mensaje creado exitosamente',
      };
    } catch (error) {
      this.logger.error('Error al crear mensaje:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Obtener todos los mensajes con filtros y paginación
   * Pattern: message-processor.get.messages
   */
  @MessagePattern('message-processor.get.messages')
  async findAll(@Payload() queryDto: QueryMessagesDto) {
    this.logger.log('Obteniendo lista de mensajes con filtros');

    try {
      const result = await this.messagesService.findAll(queryDto);
      return {
        success: true,
        data: result.messages,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error al obtener mensajes:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Obtener un mensaje específico por ID
   * Pattern: message-processor.get.message
   */
  @MessagePattern('message-processor.get.message')
  async findOne(@Payload() payload: { id: string }) {
    this.logger.log(`Obteniendo mensaje con ID: ${payload.id}`);

    try {
      const message = await this.messagesService.findOne(payload.id);
      return {
        success: true,
        data: message,
      };
    } catch (error) {
      this.logger.error(
        `Error al obtener mensaje ${payload.id}:`,
        error.message,
      );
      throw new RpcException(error);
    }
  }

  /**
   * Obtener mensajes de una conversación específica
   * Pattern: message-processor.get.conversation.messages
   */
  @MessagePattern('message-processor.get.conversation.messages')
  async findByConversation(
    @Payload()
    payload: {
      conversationId: string;
      page?: number;
      limit?: number;
      direction?: 'incoming' | 'outgoing';
    },
  ) {
    this.logger.log(
      `Obteniendo mensajes de la conversación: ${payload.conversationId}`,
    );

    const options = {
      page: payload.page || 1,
      limit: payload.limit || 50,
      direction: payload.direction,
    };

    try {
      const result = await this.messagesService.findByConversation(
        payload.conversationId,
        options,
      );
      return {
        success: true,
        data: result.messages,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error al obtener mensajes de conversación ${payload.conversationId}:`,
        error.message,
      );
      throw new RpcException(error);
    }
  }

  /**
   * Buscar mensajes por contenido
   * Pattern: message-processor.search.messages
   */
  @MessagePattern('message-processor.search.messages')
  async search(@Payload() searchDto: SearchMessagesDto) {
    this.logger.log(`Buscando mensajes con término: "${searchDto.q}"`);

    if (!searchDto.q) {
      throw new RpcException('Término de búsqueda requerido');
    }

    try {
      const result = await this.messagesService.search(searchDto.q, {
        page: searchDto.page,
        limit: searchDto.limit,
        conversationId: searchDto.conversationId,
        channel: searchDto.channel,
      });
      return {
        success: true,
        data: result.messages,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          searchTerm: searchDto.q,
        },
      };
    } catch (error) {
      this.logger.error('Error en búsqueda de mensajes:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Actualizar un mensaje
   * Pattern: message-processor.update.message
   */
  @MessagePattern('message-processor.update.message')
  async update(
    @Payload() payload: { id: string; updateData: UpdateMessageDto },
  ) {
    this.logger.log(`Actualizando mensaje: ${payload.id}`);

    try {
      const message = await this.messagesService.update(
        payload.id,
        payload.updateData,
      );
      return {
        success: true,
        data: message,
        message: 'Mensaje actualizado exitosamente',
      };
    } catch (error) {
      this.logger.error(
        `Error al actualizar mensaje ${payload.id}:`,
        error.message,
      );
      throw new RpcException(error);
    }
  }

  /**
   * Eliminar un mensaje
   * Pattern: message-processor.delete.message
   */
  @MessagePattern('message-processor.delete.message')
  async remove(@Payload() payload: { id: string }) {
    this.logger.log(`Eliminando mensaje: ${payload.id}`);

    try {
      await this.messagesService.remove(payload.id);
      return {
        success: true,
        message: `Mensaje ${payload.id} eliminado exitosamente`,
      };
    } catch (error) {
      this.logger.error(
        `Error al eliminar mensaje ${payload.id}:`,
        error.message,
      );
      throw new RpcException(error);
    }
  }

  /**
   * Obtener estadísticas de mensajes
   * Pattern: message-processor.get.stats
   */
  @MessagePattern('message-processor.get.stats')
  async getStats(@Payload() statsDto: StatsMessagesDto) {
    this.logger.log('Obteniendo estadísticas de mensajes');

    try {
      const stats = await this.messagesService.getStats({
        dateFrom: statsDto.dateFrom,
        dateTo: statsDto.dateTo,
        conversationId: statsDto.conversationId,
        channel: statsDto.channel,
      });
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error('Error al obtener estadísticas:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Marcar mensajes como leídos
   * Pattern: message-processor.mark.read
   */
  @MessagePattern('message-processor.mark.read')
  async markAsRead(@Payload() payload: { conversationId: string }) {
    this.logger.log(
      `Marcando mensajes como leídos en conversación: ${payload.conversationId}`,
    );

    try {
      await this.messagesService.markAsRead(payload.conversationId);
      return {
        success: true,
        message: 'Mensajes marcados como leídos',
      };
    } catch (error) {
      this.logger.error(`Error al marcar mensajes como leídos:`, error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Crear mensaje rápido (útil para testing)
   * Pattern: message-processor.create.quick
   */
  @MessagePattern('message-processor.create.quick')
  async createQuickMessage(
    @Payload()
    payload: {
      conversationId: string;
      content: string;
      direction?: 'incoming' | 'outgoing';
      type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'interactive';
    },
  ) {
    this.logger.log(
      `Creando mensaje rápido para conversación: ${payload.conversationId}`,
    );

    const createMessageDto: CreateMessageDto = {
      conversationId: payload.conversationId,
      content: payload.content,
      direction: payload.direction || 'incoming',
      type: payload.type || 'text',
    };

    try {
      const message = await this.messagesService.create(createMessageDto);
      return {
        success: true,
        data: message,
        message: 'Mensaje rápido creado exitosamente',
      };
    } catch (error) {
      this.logger.error('Error al crear mensaje rápido:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Health check del microservicio
   * Pattern: message-processor.health.check
   */
  @MessagePattern('message-processor.health.check')
  async healthCheck() {
    this.logger.log('Health check solicitado');

    try {
      // Puedes agregar verificaciones adicionales aquí (DB, etc.)
      return {
        success: true,
        status: 'healthy',
        service: 'message-processor',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error en health check:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Normalizar mensaje desde canal (método principal para procesar mensajes de canales)
   * Pattern: message-processor.normalize.message
   */
  @MessagePattern('message-processor.normalize.message')
  async normalizeMessage(
    @Payload()
    payload: {
      senderId: string;
      recipientId: string;
      channel: string;
      text?: string;
      attachments?: Array<{
        type: string;
        url: string;
        mime_type?: string;
      }>;
      timestamp: number;
      metadata?: any;
    },
  ) {
    this.logger.log(
      `Normalizando mensaje del canal: ${payload.channel} de ${payload.senderId}`,
    );

    try {
      // 1. Buscar o crear conversación
      const conversation = await this.conversationsService.findOrCreate(
        payload.senderId,
        payload.channel,
      );

      // 2. Normalizar el mensaje
      const messageDto: CreateMessageDto = {
        conversationId: conversation.id,
        direction: 'incoming', // Los mensajes de canales siempre son incoming
        type: this.determineMessageType(payload.text, payload.attachments),
        content: payload.text,
        metadata: {
          senderId: payload.senderId,
          timestamp: payload.timestamp,
          channel: payload.channel,
          ...payload.metadata,
        },
        attachments: payload.attachments?.map((att) => ({
          type: att.type as any,
          url: att.url,
          mimeType: att.mime_type,
        })),
      };

      // 3. Crear el mensaje
      const message = await this.messagesService.create(messageDto);

      return {
        success: true,
        data: {
          message,
          conversation,
        },
        message: 'Mensaje normalizado y guardado exitosamente',
      };
    } catch (error) {
      this.logger.error('Error normalizando mensaje:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Método auxiliar para determinar el tipo de mensaje
   */
  private determineMessageType(
    text?: string,
    attachments?: any[],
  ): 'text' | 'image' | 'video' | 'audio' | 'file' | 'interactive' {
    if (attachments && attachments.length > 0) {
      const firstAttachment = attachments[0];
      switch (firstAttachment.type) {
        case 'image':
          return 'image';
        case 'video':
          return 'video';
        case 'audio':
          return 'audio';
        case 'file':
          return 'file';
        default:
          return 'file';
      }
    }

    return text ? 'text' : 'text';
  }
}
