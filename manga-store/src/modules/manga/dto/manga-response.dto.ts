import { ApiProperty } from '@nestjs/swagger';
import { Manga } from '../entities/manga.entity';

class AuthorDto {
  @ApiProperty({ description: 'ID автора', example: 1 })
  id: number;

  @ApiProperty({ description: 'Имя автора', example: 'Хадзимэ' })
  firstName: string;

  @ApiProperty({ description: 'Фамилия автора', example: 'Исаяма' })
  lastName: string;

  @ApiProperty({ description: 'Псевдоним', example: null, required: false })
  pseudonym?: string;

  @ApiProperty({ description: 'Отображаемое имя', example: 'Хадзимэ Исаяма' })
  displayName: string;
}

class GenreDto {
  @ApiProperty({ description: 'ID жанра', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название жанра', example: 'Драма' })
  name: string;

  @ApiProperty({ description: 'Описание жанра', required: false })
  description?: string;
}

class PublisherDto {
  @ApiProperty({ description: 'ID издательства', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название издательства', example: 'Comix Wave Films' })
  name: string;

  @ApiProperty({ description: 'Страна издательства', example: 'Япония', required: false })
  country?: string;

  @ApiProperty({ description: 'Описание издательства', required: false })
  description?: string;

  @ApiProperty({ description: 'Веб-сайт', required: false })
  website?: string;

  @ApiProperty({ description: 'Активно ли издательство', example: true })
  isActive: boolean;
}

export class MangaResponseDto {
  @ApiProperty({ description: 'ID манги', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название манги', example: 'Атака титанов' })
  title: string;

  @ApiProperty({ description: 'Описание манги', required: false })
  description?: string;

  @ApiProperty({ description: 'ISBN', example: '978-5-389-12345-6', required: false })
  isbn?: string;

  @ApiProperty({ description: 'Цена', example: 890.50 })
  price: number;

  @ApiProperty({ description: 'Цена со скидкой', example: 712.40, required: false })
  discountPrice?: number | undefined;

  @ApiProperty({ description: 'Количество на складе', example: 15 })
  stock: number;

  @ApiProperty({ description: 'Количество страниц', example: 192, required: false })
  pages?: number;

  @ApiProperty({ description: 'Язык', example: 'Russian' })
  language: string;

  @ApiProperty({ description: 'URL изображения', example: '/images/attack-on-titan-1.jpg', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Активна ли манга', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Рекомендуемая ли манга', example: true })
  isFeatured: boolean;

  @ApiProperty({ description: 'Дата публикации', example: '2023-01-15T00:00:00.000Z', required: false })
  publishDate?: string;

  @ApiProperty({ description: 'Доступна ли для покупки', example: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'Авторы манги', type: [AuthorDto] })
  authors: AuthorDto[];

  @ApiProperty({ description: 'Жанры манги', type: [GenreDto] })
  genres: GenreDto[];

  @ApiProperty({ description: 'Издательство', type: PublisherDto, required: false })
  publisher?: PublisherDto;

  @ApiProperty({ description: 'Дата создания', example: '2024-01-15T10:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'Дата обновления', example: '2024-01-20T15:45:00.000Z' })
  updatedAt: string;

  constructor(manga: Manga) {
    this.id = manga.id;
    this.title = manga.title;
    this.description = manga.description || undefined;
    this.isbn = manga.isbn || undefined;
    this.price = manga.price;
    this.discountPrice = manga.discountPrice || undefined;
    this.stock = manga.stock;
    this.pages = manga.pages || undefined;
    this.language = manga.language;
    this.imageUrl = manga.imageUrl || undefined;
    this.isActive = manga.isActive;
    this.isFeatured = manga.isFeatured;
    this.publishDate = manga.publishDate?.toISOString();
    this.isAvailable = manga.isAvailable;
    this.authors = manga.authors || [];
    this.genres = manga.genres || [];

    if (manga.publisher) {
      this.publisher = {
        id: manga.publisher.id,
        name: manga.publisher.name,
        country: manga.publisher.country || undefined,
        description: manga.publisher.description || undefined,
        website: manga.publisher.website || undefined,
        isActive: manga.publisher.isActive,
      };
    }

    this.createdAt = manga.createdAt.toISOString();
    this.updatedAt = manga.updatedAt.toISOString();
  }
}