import { IsEnum, IsNumber, IsDateString, IsOptional, IsBoolean, IsString, Min } from 'class-validator';
import { SubscriptionType, SubscriptionStatus } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsNumber()
  @Min(0)
  price: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsString()
  userId: string;
}
