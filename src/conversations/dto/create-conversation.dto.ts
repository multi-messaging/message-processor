import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  channel: string;

  @IsEnum(['active', 'closed', 'pending'])
  @IsOptional()
  status?: 'active' | 'closed' | 'pending' = 'active';
}