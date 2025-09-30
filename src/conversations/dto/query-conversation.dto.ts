import { IsOptional, IsString, IsEnum, IsNumberString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryConversationsDto {
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['active', 'closed', 'pending'])
  status?: 'active' | 'closed' | 'pending';

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  customerId?: string;
}