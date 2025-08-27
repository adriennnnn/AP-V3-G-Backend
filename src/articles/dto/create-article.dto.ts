import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
