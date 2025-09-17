import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { MangaType } from '../../manga/graphql/manga.types';

@ObjectType({ description: 'Пользователь (краткая информация)' })
export class UserType {
  @Field(() => ID, { description: 'Уникальный идентификатор пользователя' })
  id: number;

  @Field({ description: 'Имя пользователя' })
  firstName: string;

  @Field({ description: 'Фамилия пользователя' })
  lastName: string;

  @Field({ description: 'Полное имя пользователя' })
  fullName: string;
}

@ObjectType({ description: 'Отзыв на мангу' })
export class ReviewType {
  @Field(() => ID, { description: 'Уникальный идентификатор отзыва' })
  id: number;

  @Field(() => Int, { description: 'Рейтинг от 1 до 5' })
  rating: number;

  @Field({ nullable: true, description: 'Текст отзыва' })
  comment?: string;

  @Field(() => ID, { description: 'ID пользователя, оставившего отзыв' })
  userId: number;

  @Field(() => ID, { description: 'ID манги, к которой относится отзыв' })
  mangaId: number;

  @Field(() => UserType, { description: 'Информация о пользователе' })
  user: UserType;

  @Field(() => MangaType, { description: 'Информация о манге' })
  manga: MangaType;

  @Field({ description: 'Дата создания отзыва' })
  createdAt: Date;

  @Field({ description: 'Дата последнего обновления отзыва' })
  updatedAt: Date;
}

@ObjectType({ description: 'Статистика отзывов' })
export class ReviewStatsType {
  @Field(() => Int, { description: 'Общее количество отзывов' })
  totalReviews: number;

  @Field(() => Int, { description: 'Средний рейтинг (умножен на 10 для точности)' })
  averageRating: number;

  @Field(() => [Int], { description: 'Распределение рейтингов [1, 2, 3, 4, 5]' })
  ratingDistribution: number[];
}