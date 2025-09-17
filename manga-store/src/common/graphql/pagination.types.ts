import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

@InputType({ description: 'Параметры пагинации' })
export class PaginationInput {
  @Field(() => Int, { nullable: true, description: 'Номер страницы (начиная с 1)', defaultValue: 1 })
  @IsNumber({}, { message: 'Номер страницы должен быть числом' })
  @Min(1, { message: 'Номер страницы должен быть больше 0' })
  @IsOptional()
  page?: number = 1;

  @Field(() => Int, { nullable: true, description: 'Количество элементов на странице', defaultValue: 10 })
  @IsNumber({}, { message: 'Размер страницы должен быть числом' })
  @Min(1, { message: 'Размер страницы должен быть больше 0' })
  @Max(100, { message: 'Размер страницы не может превышать 100' })
  @IsOptional()
  limit?: number = 10;
}

@ObjectType({ description: 'Информация о пагинации' })
export class PaginationInfoType {
  @Field(() => Int, { description: 'Текущая страница' })
  currentPage: number;

  @Field(() => Int, { description: 'Общее количество страниц' })
  totalPages: number;

  @Field(() => Int, { description: 'Количество элементов на странице' })
  pageSize: number;

  @Field(() => Int, { description: 'Общее количество элементов' })
  totalCount: number;

  @Field({ description: 'Есть ли следующая страница' })
  hasNextPage: boolean;

  @Field({ description: 'Есть ли предыдущая страница' })
  hasPreviousPage: boolean;
}

export function PaginatedResponse<T>(ItemType: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [ItemType], { description: 'Список элементов' })
    items: T[];

    @Field(() => PaginationInfoType, { description: 'Информация о пагинации' })
    pagination: PaginationInfoType;
  }

  return PaginatedType;
}