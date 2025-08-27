import { PartialType } from '@nestjs/mapped-types';
import { CreateAffiliateDto } from './create-affiliate.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { AffiliateStatus } from '../entities/affiliate.entity';

export class UpdateAffiliateDto extends PartialType(CreateAffiliateDto) {
  @IsOptional()
  @IsEnum(AffiliateStatus)
  status?: AffiliateStatus;
}
