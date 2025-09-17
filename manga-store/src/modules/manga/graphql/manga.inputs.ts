import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

@InputType({ description: 'Входные данные для создания манги' })
export class CreateMangaInput {
  @Field({ description: 'Название манги' })
  @IsString({ message: 'Название должно быть строкой' })
  title: string;

  @Field({ nullable: true, description: 'Описание манги' })
  @IsString({ message: 'Описание должно быть строкой' })
  @IsOptional()
  description?: string;

  @Field({ nullable: true, description: 'ISBN манги' })
  @IsString({ message: 'ISBN должен быть строкой' })
  @IsOptional()
  isbn?: string;

  @Field(() => Float, { description: 'Цена манги' })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price: number;

  @Field(() => Float, { nullable: true, description: 'Цена со скидкой' })
  @IsNumber({}, { message: 'Цена со скидкой должна быть числом' })
  @Min(0, { message: 'Цена со скидкой не может быть отрицательной' })
  @IsOptional()
  discountPrice?: number;

  @Field(() => Int, { description: 'Количество на складе' })
  @IsNumber({}, { message: 'Количество должно быть числом' })
  @Min(0, { message: 'Количество не может быть отрицательным' })
  stock: number;

  @Field(() => Int, { nullable: true, description: 'Количество страниц' })
  @IsNumber({}, { message: 'Количество страниц должно быть числом' })
  @Min(1, { message: 'Количество страниц должно быть больше 0' })
  @IsOptional()
  pages?: number;

  @Field({ description: 'Язык публикации' })
  @IsString({ message: 'Язык должен быть строкой' })
  language: string;

  @Field({ nullable: true, description: 'URL изображения обложки' })
  @IsString({ message: 'URL изображения должен быть строкой' })
  @IsOptional()
  imageUrl?: string;

  @Field(() => Int, { description: 'ID автора' })
  @IsNumber({}, { message: 'ID автора должен быть числом' })
  authorId: number;

  @Field(() => Int, { description: 'ID жанра' })
  @IsNumber({}, { message: 'ID жанра должен быть числом' })
  genreId: number;

  @Field(() => Int, { description: 'ID издательства' })
  @IsNumber({}, { message: 'ID издательства должен быть числом' })
  publisherId: number;
}

@InputType({ description: 'Входные данные для обновления манги' })
export class UpdateMangaInput {
  @Field({ nullable: true, description: 'Название манги' })
  @IsString({ message: 'Название должно быть строкой' })
  @IsOptional()
  title?: string;

  @Field({ nullable: true, description: 'Описание манги' })
  @IsString({ message: 'Описание должно быть строкой' })
  @IsOptional()
  description?: string;

  @Field(() => Float, { nullable: true, description: 'Цена манги' })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  @IsOptional()
  price?: number;

  @Field(() => Float, { nullable: true, description: 'Цена со скидкой' })
  @IsNumber({}, { message: 'Цена со скидкой должна быть числом' })
  @Min(0, { message: 'Цена со скидкой не может быть отрицательной' })
  @IsOptional()
  discountPrice?: number;

  @Field(() => Int, { nullable: true, description: 'Количество на складе' })
  @IsNumber({}, { message: 'Количество должно быть числом' })
  @Min(0, { message: 'Количество не может быть отрицательным' })
  @IsOptional()
  stock?: number;

  @Field({ nullable: true, description: 'Язык публикации' })
  @IsString({ message: 'Язык должен быть строкой' })
  @IsOptional()
  language?: string;

  @Field({ nullable: true, description: 'URL изображения обложки' })
  @IsString({ message: 'URL изображения должен быть строкой' })
  @IsOptional()
  imageUrl?: string;

  @Field({ nullable: true, description: 'Активна ли манга для продажи' })
  @IsBoolean({ message: 'Статус активности должен быть булевым' })
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true, description: 'Рекомендуемая ли манга' })
  @IsBoolean({ message: 'Статус рекомендации должен быть булевым' })
  @IsOptional()
  isFeatured?: boolean;
}

@InputType({ description: 'Входные данные для фильтрации манги' })
export class MangaFiltersInput {
  @Field({ nullable: true, description: 'Поиск по названию' })
  @IsString({ message: 'Поиск должен быть строкой' })
  @IsOptional()
  search?: string;

  @Field({ nullable: true, description: 'Фильтр по жанру' })
  @IsString({ message: 'Жанр должен быть строкой' })
  @IsOptional()
  genre?: string;

  @Field({ nullable: true, description: 'Фильтр по автору' })
  @IsString({ message: 'Автор должен быть строкой' })
  @IsOptional()
  author?: string;

  @Field(() => Float, { nullable: true, description: 'Минимальная цена' })
  @IsNumber({}, { message: 'Минимальная цена должна быть числом' })
  @Min(0, { message: 'Минимальная цена не может быть отрицательной' })
  @IsOptional()
  priceMin?: number;

  @Field(() => Float, { nullable: true, description: 'Максимальная цена' })
  @IsNumber({}, { message: 'Максимальная цена должна быть числом' })
  @Min(0, { message: 'Максимальная цена не может быть отрицательной' })
  @IsOptional()
  priceMax?: number;

  @Field({ nullable: true, description: 'Только товары в наличии' })
  @IsBoolean({ message: 'Фильтр наличия должен быть булевым' })
  @IsOptional()
  inStock?: boolean;

  @Field({ nullable: true, description: 'Сортировка (price, title, createdAt)' })
  @IsString({ message: 'Сортировка должна быть строкой' })
  @IsOptional()
  sort?: string;

  @Field({ nullable: true, description: 'Порядок сортировки (asc, desc)' })
  @IsString({ message: 'Порядок должен быть строкой' })
  @IsOptional()
  order?: string;
}