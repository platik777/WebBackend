import { ApiProperty } from '@nestjs/swagger';

class ReviewUserDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Имя пользователя', example: 'Иван' })
  firstName: string;

  @ApiProperty({ description: 'Фамилия пользователя', example: 'Иванов' })
  lastName: string;

  @ApiProperty({ description: 'Полное имя', example: 'Иван Иванов' })
  fullName: string;
}

class ReviewMangaDto {
  @ApiProperty({ description: 'ID манги', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название манги', example: 'Атака титанов' })
  title: string;

  @ApiProperty({ description: 'URL изображения', example: '/images/attack-on-titan-1.jpg', required: false })
  imageUrl?: string;
}

export class ReviewResponseDto {
  @ApiProperty({ description: 'ID отзыва', example: 1 })
  id: number;

  @ApiProperty({ description: 'Рейтинг', example: 5, minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ description: 'Комментарий', example: 'Отличная манга!', required: false })
  comment?: string;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  userId: number;

  @ApiProperty({ description: 'ID манги', example: 1 })
  mangaId: number;

  @ApiProperty({ description: 'Информация о пользователе', type: ReviewUserDto })
  user: ReviewUserDto;

  @ApiProperty({ description: 'Информация о манге', type: ReviewMangaDto })
  manga: ReviewMangaDto;

  @ApiProperty({ description: 'Дата создания отзыва', example: '2024-01-15T10:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'Дата обновления отзыва', example: '2024-01-20T15:45:00.000Z' })
  updatedAt: string;

  constructor(review: any) {
    this.id = review.id;
    this.rating = review.rating;
    this.comment = review.comment;
    this.userId = review.userId;
    this.mangaId = review.mangaId;
    this.user = {
      id: review.user.id,
      firstName: review.user.firstName,
      lastName: review.user.lastName,
      fullName: `${review.user.firstName} ${review.user.lastName}`,
    };
    this.manga = {
      id: review.manga.id,
      title: review.manga.title,
      imageUrl: review.manga.imageUrl,
    };
    this.createdAt = review.createdAt.toISOString();
    this.updatedAt = review.updatedAt.toISOString();
  }
}