import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Автор манги' })
export class AuthorType {
  @Field(() => ID, { description: 'Уникальный идентификатор автора' })
  id: number;

  @Field({ description: 'Имя автора' })
  firstName: string;

  @Field({ description: 'Фамилия автора' })
  lastName: string;

  @Field({ nullable: true, description: 'Псевдоним автора' })
  pseudonym?: string;

  @Field({ description: 'Отображаемое имя автора' })
  displayName: string;
}

@ObjectType({ description: 'Жанр манги' })
export class GenreType {
  @Field(() => ID, { description: 'Уникальный идентификатор жанра' })
  id: number;

  @Field({ description: 'Название жанра' })
  name: string;

  @Field({ nullable: true, description: 'Описание жанра' })
  description?: string;
}

@ObjectType({ description: 'Издательство' })
export class PublisherType {
  @Field(() => ID, { description: 'Уникальный идентификатор издательства' })
  id: number;

  @Field({ description: 'Название издательства' })
  name: string;

  @Field({ nullable: true, description: 'Страна издательства' })
  country?: string;

  @Field({ nullable: true, description: 'Описание издательства' })
  description?: string;

  @Field({ nullable: true, description: 'Веб-сайт издательства' })
  website?: string;

  @Field({ description: 'Активно ли издательство' })
  isActive: boolean;
}

@ObjectType({ description: 'Манга' })
export class MangaType {
  @Field(() => ID, { description: 'Уникальный идентификатор манги' })
  id: number;

  @Field({ description: 'Название манги' })
  title: string;

  @Field({ nullable: true, description: 'Описание манги' })
  description?: string;

  @Field({ nullable: true, description: 'ISBN манги' })
  isbn?: string;

  @Field(() => Float, { description: 'Цена манги' })
  price: number;

  @Field(() => Float, { nullable: true, description: 'Цена со скидкой' })
  discountPrice?: number;

  @Field(() => Int, { description: 'Количество на складе' })
  stock: number;

  @Field(() => Int, { nullable: true, description: 'Количество страниц' })
  pages?: number;

  @Field({ description: 'Язык публикации' })
  language: string;

  @Field({ nullable: true, description: 'URL изображения обложки' })
  imageUrl?: string;

  @Field({ description: 'Активна ли манга для продажи' })
  isActive: boolean;

  @Field({ description: 'Рекомендуемая ли манга' })
  isFeatured: boolean;

  @Field({ nullable: true, description: 'Дата публикации' })
  publishDate?: Date;

  @Field({ description: 'Доступна ли для покупки' })
  isAvailable: boolean;

  @Field(() => [AuthorType], { description: 'Авторы манги' })
  authors: AuthorType[];

  @Field(() => [GenreType], { description: 'Жанры манги' })
  genres: GenreType[];

  @Field(() => PublisherType, { nullable: true, description: 'Издательство' })
  publisher?: PublisherType;

  @Field({ description: 'Дата создания записи' })
  createdAt: Date;

  @Field({ description: 'Дата последнего обновления' })
  updatedAt: Date;
}