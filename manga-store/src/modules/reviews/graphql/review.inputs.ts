import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

@InputType({ description: 'Входные данные для создания отзыва' })
export class CreateReviewInput {
  @Field(() => Int, { description: 'Рейтинг от 1 до 5' })
  @IsNumber({}, { message: 'Рейтинг должен быть числом' })
  @Min(1, { message: 'Рейтинг не может быть меньше 1' })
  @Max(5, { message: 'Рейтинг не может быть больше 5' })
  rating: number;

  @Field({ nullable: true, description: 'Текст отзыва' })
  @IsString({ message: 'Комментарий должен быть строкой' })
  @IsOptional()
  comment?: string;

  @Field(() => ID, { description: 'ID пользователя' })
  @IsNumber({}, { message: 'ID пользователя должен быть числом' })
  userId: number;

  @Field(() => ID, { description: 'ID манги' })
  @IsNumber({}, { message: 'ID манги должен быть числом' })
  mangaId: number;
}

@InputType({ description: 'Входные данные для обновления отзыва' })
export class UpdateReviewInput {
  @Field(() => Int, { nullable: true, description: 'Рейтинг от 1 до 5' })
  @IsNumber({}, { message: 'Рейтинг должен быть числом' })
  @Min(1, { message: 'Рейтинг не может быть меньше 1' })
  @Max(5, { message: 'Рейтинг не может быть больше 5' })
  @IsOptional()
  rating?: number;

  @Field({ nullable: true, description: 'Текст отзыва' })
  @IsString({ message: 'Комментарий должен быть строкой' })
  @IsOptional()
  comment?: string;
}

@InputType({ description: 'Входные данные для фильтрации отзывов' })
export class ReviewFiltersInput {
  @Field(() => ID, { nullable: true, description: 'Фильтр по ID манги' })
  @IsNumber({}, { message: 'ID манги должен быть числом' })
  @IsOptional()
  mangaId?: number;

  @Field(() => ID, { nullable: true, description: 'Фильтр по ID пользователя' })
  @IsNumber({}, { message: 'ID пользователя должен быть числом' })
  @IsOptional()
  userId?: number;

  @Field(() => Int, { nullable: true, description: 'Фильтр по рейтингу' })
  @IsNumber({}, { message: 'Рейтинг должен быть числом' })
  @Min(1, { message: 'Рейтинг не может быть меньше 1' })
  @Max(5, { message: 'Рейтинг не может быть больше 5' })
  @IsOptional()
  rating?: number;

  @Field(() => Int, { nullable: true, description: 'Минимальный рейтинг' })
  @IsNumber({}, { message: 'Минимальный рейтинг должен быть числом' })
  @Min(1, { message: 'Минимальный рейтинг не может быть меньше 1' })
  @Max(5, { message: 'Минимальный рейтинг не может быть больше 5' })
  @IsOptional()
  minRating?: number;
}