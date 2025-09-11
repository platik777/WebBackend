import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsUrl,
  IsInt,
} from 'class-validator';

export class CreateMangaDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsInt()
  authorId: number;

  @IsInt()
  genreId: number;

  @IsInt()
  publisherId: number;
}