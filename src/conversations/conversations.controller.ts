import { Controller, Logger } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

@Controller()
export class ConversationsController {
  private readonly logger = new Logger(ConversationsController.name);

  constructor(private readonly conversationsService: ConversationsService) {}

  /**
   * Crear una nueva conversación
   * Pattern: message-processor.create.conversation
   */
  @MessagePattern('message-processor.create.conversation')
  async create(@Payload() createConversationDto: CreateConversationDto) {
    this.logger.log(`Creando nueva conversación para customer: ${createConversationDto.customerId} en canal: ${createConversationDto.channel}`);
    
    try {
      const conversation = await this.conversationsService.create(createConversationDto);
      return {
        success: true,
        data: conversation,
        message: 'Conversación creada exitosamente'
      };
    } catch (error) {
      this.logger.error('Error al crear conversación:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Obtener todas las conversaciones con filtros y paginación
   * Pattern: message-processor.get.conversations
   */
  @MessagePattern('message-processor.get.conversations')
  async findAll(@Payload() options: {
    page?: number;
    limit?: number;
    status?: string;
    channel?: string;
    customerId?: string;
  }) {
    this.logger.log('Obteniendo lista de conversaciones');
    
    try {
      const result = await this.conversationsService.findAll(options);
      return {
        success: true,
        data: result.conversations,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }
      };
    } catch (error) {
      this.logger.error('Error al obtener conversaciones:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Obtener una conversación específica por ID
   * Pattern: message-processor.get.conversation
   */
  @MessagePattern('message-processor.get.conversation')
  async findOne(@Payload() payload: { id: string }) {
    this.logger.log(`Obteniendo conversación con ID: ${payload.id}`);
    
    try {
      const conversation = await this.conversationsService.findOne(payload.id);
      return {
        success: true,
        data: conversation
      };
    } catch (error) {
      this.logger.error(`Error al obtener conversación ${payload.id}:`, error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Buscar conversación por customer y canal
   * Pattern: message-processor.find.conversation.by.customer.channel
   */
  @MessagePattern('message-processor.find.conversation.by.customer.channel')
  async findByCustomerAndChannel(@Payload() payload: {
    customerId: string;
    channel: string;
  }) {
    this.logger.log(`Buscando conversación para customer: ${payload.customerId} en canal: ${payload.channel}`);
    
    try {
      const conversation = await this.conversationsService.findByCustomerAndChannel(
        payload.customerId, 
        payload.channel
      );
      return {
        success: true,
        data: conversation,
        found: !!conversation
      };
    } catch (error) {
      this.logger.error('Error al buscar conversación:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Obtener o crear conversación (endpoint útil para cuando llega un mensaje)
   * Pattern: message-processor.find.or.create.conversation
   */
  @MessagePattern('message-processor.find.or.create.conversation')
  async findOrCreate(@Payload() payload: { 
    customerId: string; 
    channel: string; 
  }) {
    this.logger.log(`Obteniendo o creando conversación para customer: ${payload.customerId} en canal: ${payload.channel}`);
    
    try {
      const conversation = await this.conversationsService.findOrCreate(
        payload.customerId, 
        payload.channel
      );
      return {
        success: true,
        data: conversation
      };
    } catch (error) {
      this.logger.error('Error al obtener o crear conversación:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Actualizar una conversación
   * Pattern: message-processor.update.conversation
   */
  @MessagePattern('message-processor.update.conversation')
  async update(@Payload() payload: {
    id: string;
    updateData: UpdateConversationDto;
  }) {
    this.logger.log(`Actualizando conversación: ${payload.id}`);
    
    try {
      const conversation = await this.conversationsService.update(
        payload.id, 
        payload.updateData
      );
      return {
        success: true,
        data: conversation,
        message: 'Conversación actualizada exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error al actualizar conversación ${payload.id}:`, error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Cerrar una conversación
   * Pattern: message-processor.close.conversation
   */
  @MessagePattern('message-processor.close.conversation')
  async close(@Payload() payload: { id: string }) {
    this.logger.log(`Cerrando conversación: ${payload.id}`);
    
    try {
      const conversation = await this.conversationsService.close(payload.id);
      return {
        success: true,
        data: conversation,
        message: 'Conversación cerrada exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error al cerrar conversación ${payload.id}:`, error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Reactivar una conversación
   * Pattern: message-processor.reactivate.conversation
   */
  @MessagePattern('message-processor.reactivate.conversation')
  async reactivate(@Payload() payload: { id: string }) {
    this.logger.log(`Reactivando conversación: ${payload.id}`);
    
    try {
      const conversation = await this.conversationsService.reactivate(payload.id);
      return {
        success: true,
        data: conversation,
        message: 'Conversación reactivada exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error al reactivar conversación ${payload.id}:`, error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Eliminar una conversación
   * Pattern: message-processor.delete.conversation
   */
  @MessagePattern('message-processor.delete.conversation')
  async remove(@Payload() payload: { id: string }) {
    this.logger.log(`Eliminando conversación: ${payload.id}`);
    
    try {
      await this.conversationsService.remove(payload.id);
      return {
        success: true,
        message: `Conversación ${payload.id} eliminada exitosamente`
      };
    } catch (error) {
      this.logger.error(`Error al eliminar conversación ${payload.id}:`, error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Obtener estadísticas de conversaciones
   * Pattern: message-processor.get.conversations.stats
   */
  @MessagePattern('message-processor.get.conversations.stats')
  async getStats() {
    this.logger.log('Obteniendo estadísticas de conversaciones');
    
    try {
      const stats = await this.conversationsService.getStats();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      this.logger.error('Error al obtener estadísticas:', error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Health check específico para conversaciones
   * Pattern: message-processor.conversations.health.check
   */
  @MessagePattern('message-processor.conversations.health.check')
  async healthCheck() {
    this.logger.log('Health check de conversaciones solicitado');
    
    try {
      // Verificar que el servicio puede acceder a la base de datos
      const stats = await this.conversationsService.getStats();
      
      return {
        success: true,
        status: 'healthy',
        service: 'conversations',
        timestamp: new Date().toISOString(),
        data: {
          totalConversations: stats.total,
          activeConversations: stats.active,
        }
      };
    } catch (error) {
      this.logger.error('Error en health check de conversaciones:', error.message);
      throw new RpcException({
        status: 'unhealthy',
        service: 'conversations',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Obtener conversaciones por canal
   * Pattern: message-processor.get.conversations.by.channel
   */
  @MessagePattern('message-processor.get.conversations.by.channel')
  async getConversationsByChannel(@Payload() payload: {
    channel: string;
    page?: number;
    limit?: number;
    status?: string;
  }) {
    this.logger.log(`Obteniendo conversaciones del canal: ${payload.channel}`);
    
    try {
      const result = await this.conversationsService.findAll({
        channel: payload.channel,
        page: payload.page || 1,
        limit: payload.limit || 10,
        status: payload.status,
      });
      
      return {
        success: true,
        data: result.conversations,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          channel: payload.channel,
        }
      };
    } catch (error) {
      this.logger.error(`Error al obtener conversaciones del canal ${payload.channel}:`, error.message);
      throw new RpcException(error);
    }
  }

  /**
   * Obtener conversaciones por customer
   * Pattern: message-processor.get.conversations.by.customer
   */
  @MessagePattern('message-processor.get.conversations.by.customer')
  async getConversationsByCustomer(@Payload() payload: {
    customerId: string;
    page?: number;
    limit?: number;
    status?: string;
  }) {
    this.logger.log(`Obteniendo conversaciones del customer: ${payload.customerId}`);
    
    try {
      const result = await this.conversationsService.findAll({
        customerId: payload.customerId,
        page: payload.page || 1,
        limit: payload.limit || 10,
        status: payload.status,
      });
      
      return {
        success: true,
        data: result.conversations,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          customerId: payload.customerId,
        }
      };
    } catch (error) {
      this.logger.error(`Error al obtener conversaciones del customer ${payload.customerId}:`, error.message);
      throw new RpcException(error);
    }
  }
}