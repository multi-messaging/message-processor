import { 
  IsOptional, 
  IsString, 
  IsEnum, 
  IsInt,
  IsDateString, 
  IsUUID,
  Min,
  Max,
  IsBoolean
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Enums para tipar mejor
export enum MessageDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
  INTERACTIVE = 'interactive',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum SortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum StatsGroupBy {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

// DTO principal para consultas de mensajes
export class QueryMessagesDto {
  // Paginación
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número válido' })
  @Min(1, { message: 'page debe ser mayor a 0' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número válido' })
  @Min(1, { message: 'limit debe ser mayor a 0' })
  @Max(100, { message: 'limit no puede ser mayor a 100' })
  limit: number = 10;

  // Filtros por conversación
  @IsOptional()
  @IsUUID(4, { message: 'conversationId debe ser un UUID válido' })
  conversationId?: string;

  // Filtros por propiedades del mensaje
  @IsOptional()
  @IsEnum(MessageDirection, { 
    message: 'direction debe ser "incoming" o "outgoing"' 
  })
  direction?: MessageDirection;

  @IsOptional()
  @IsEnum(MessageType, {
    message: 'type debe ser uno de: text, image, video, audio, file, interactive'
  })
  type?: MessageType;

  // Búsqueda en contenido
  @IsOptional()
  @IsString({ message: 'search debe ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  // Filtros por fecha
  @IsOptional()
  @IsDateString({}, { message: 'dateFrom debe ser una fecha válida (ISO 8601)' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateTo debe ser una fecha válida (ISO 8601)' })
  dateTo?: string;

  // Filtros por canal (de la conversación)
  @IsOptional()
  @IsString({ message: 'channel debe ser una cadena de texto' })
  @Transform(({ value }) => value?.toLowerCase())
  channel?: string;

  // Filtro por customer ID
  @IsOptional()
  @IsString({ message: 'customerId debe ser una cadena de texto' })
  customerId?: string;

  // Filtros adicionales
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'hasAttachments debe ser un booleano' })
  hasAttachments?: boolean;

  // Ordenamiento
  @IsOptional()
  @IsEnum(SortOrder, { 
    message: 'sortOrder debe ser "ASC" o "DESC"' 
  })
  sortOrder: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsEnum(SortBy, {
    message: 'sortBy debe ser "createdAt" o "updatedAt"'
  })
  sortBy: SortBy = SortBy.CREATED_AT;

  // Filtros por metadata (búsqueda en campos específicos)
  @IsOptional()
  @IsString({ message: 'senderId debe ser una cadena de texto' })
  senderId?: string;

  @IsOptional()
  @IsString({ message: 'messageId debe ser una cadena de texto' })
  messageId?: string;

  // Filtros por rango de tiempo más específicos
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'timestampFrom debe ser un número válido' })
  timestampFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'timestampTo debe ser un número válido' })
  timestampTo?: number;

  // Incluir relaciones
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'includeConversation debe ser un booleano' })
  includeConversation: boolean = true;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'includeAttachments debe ser un booleano' })
  includeAttachments: boolean = true;
}

// DTO específico para búsqueda de mensajes
export class SearchMessagesDto {
  @IsString({ message: 'q (query) es requerido para la búsqueda' })
  @Transform(({ value }) => value?.trim())
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número válido' })
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número válido' })
  @Min(1)
  @Max(50)
  limit: number = 10;

  @IsOptional()
  @IsUUID(4, { message: 'conversationId debe ser un UUID válido' })
  conversationId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  channel?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsEnum(MessageDirection, { message: 'direction debe ser "incoming" o "outgoing"' })
  direction?: MessageDirection;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

// DTO para filtros de estadísticas
export class StatsMessagesDto {
  @IsOptional()
  @IsDateString({}, { message: 'dateFrom debe ser una fecha válida (ISO 8601)' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateTo debe ser una fecha válida (ISO 8601)' })
  dateTo?: string;

  @IsOptional()
  @IsUUID(4, { message: 'conversationId debe ser un UUID válido' })
  conversationId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  channel?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsEnum(StatsGroupBy, {
    message: 'groupBy debe ser "daily", "weekly" o "monthly"'
  })
  groupBy: StatsGroupBy = StatsGroupBy.DAILY;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'days debe ser un número válido' })
  @Min(1)
  @Max(365)
  days: number = 7; // Por defecto últimos 7 días
}