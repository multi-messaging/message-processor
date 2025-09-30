import { IsString, IsEnum, IsOptional, IsNotEmpty, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMessageAttachmentDto {
  @IsEnum(['image', 'video', 'audio', 'file', 'sticker'])
  type: 'image' | 'video' | 'audio' | 'file' | 'sticker';

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  size?: number;
}

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsEnum(['incoming', 'outgoing'])
  direction: 'incoming' | 'outgoing';

  @IsEnum(['text', 'image', 'video', 'audio', 'file', 'interactive'])
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'interactive';

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  metadata?: {
    header?: { type: string; content: string };
    body?: { text: string };
    footer?: { text: string };
    components?: any[];
    // Metadatos específicos del canal
    messageId?: string; // ID del mensaje en el canal original
    senderId?: string;   // ID del remitente en el canal
    timestamp?: number;  // Timestamp original del canal
  };

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMessageAttachmentDto)
  attachments?: CreateMessageAttachmentDto[];
}