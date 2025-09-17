import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsUrl,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMangaDto {
  @ApiProperty({ description: 'Название манги', example: 'Атака титанов' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Описание манги', example: 'Эпическая история о борьбе человечества с титанами', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Цена манги', example: 890.50, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Количество на складе', example: 15, minimum: 0 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ description: 'URL изображения обложки', example: '/images/attack-on-titan-1.jpg', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ description: 'ID автора', example: 1 })
  @IsInt()
  authorId: number;

  @ApiProperty({ description: 'ID жанра', example: 1 })
  @IsInt()
  genreId: number;

  @ApiProperty({ description: 'ID издательства', example: 1 })
  @IsInt()
  publisherId: number;
}