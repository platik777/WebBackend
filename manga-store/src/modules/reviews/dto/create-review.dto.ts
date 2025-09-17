import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Рейтинг от 1 до 5', example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Текст отзыва', example: 'Отличная манга! Рекомендую всем.', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'ID манги', example: 1 })
  @IsInt()
  mangaId: number;
}