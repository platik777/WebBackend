import { Args, ID, Int, Mutation, ObjectType, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { MangaService } from '../manga.service';
import { ReviewsService } from '../../reviews/reviews.service';
import { MangaType } from './manga.types';
import { ReviewType } from '../../reviews/graphql/review.types';
import { CreateMangaInput, MangaFiltersInput, UpdateMangaInput } from './manga.inputs';
import { PaginatedResponse } from '../../../common/graphql/pagination.types';

@ObjectType()
export class PaginatedMangaResponse extends PaginatedResponse(MangaType) {}

@Resolver(() => MangaType)
export class MangaResolver {
  constructor(
    private readonly mangaService: MangaService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Query(() => [MangaType], {
    name: 'manga',
    description: 'Получить список всей манги с фильтрацией'
  })
  async getMangaList(
    @Args('filters', { type: () => MangaFiltersInput, nullable: true })
      filters?: MangaFiltersInput,
  ): Promise<MangaType[]> {
    return await this.mangaService.findAll({
      search: filters?.search,
      genre: filters?.genre,
      author: filters?.author,
      priceMin: filters?.priceMin,
      priceMax: filters?.priceMax,
      inStock: filters?.inStock,
      sort: filters?.sort,
      order: filters?.order as 'asc' | 'desc',
    });
  }

  @Query(() => MangaType, {
    name: 'mangaById',
    description: 'Получить мангу по ID'
  })
  async getMangaById(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<MangaType> {
    return await this.mangaService.findOne(id);
  }

  @Query(() => [MangaType], {
    name: 'featuredManga',
    description: 'Получить рекомендуемую мангу'
  })
  async getFeaturedManga(): Promise<MangaType[]> {
    const allManga = await this.mangaService.findAll();
    return allManga.filter(manga => manga.isFeatured);
  }

  @Query(() => [MangaType], {
    name: 'availableManga',
    description: 'Получить доступную для покупки мангу'
  })
  async getAvailableManga(): Promise<MangaType[]> {
    const allManga = await this.mangaService.findAll();
    return allManga.filter(manga => manga.isActive && manga.stock > 0);
  }

  @Mutation(() => MangaType, {
    name: 'createManga',
    description: 'Создать новую мангу'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createManga(
    @Args('input', { type: () => CreateMangaInput })
      input: CreateMangaInput,
  ): Promise<MangaType> {
    return await this.mangaService.create({
      title: input.title,
      description: input.description,
      price: input.price,
      stock: input.stock,
      imageUrl: input.imageUrl,
      authorId: input.authorId,
      genreId: input.genreId,
      publisherId: input.publisherId,
    });
  }

  @Mutation(() => MangaType, {
    name: 'updateManga',
    description: 'Обновить информацию о манге'
  })
  async updateManga(
    @Args('id', { type: () => ID }) id: number,
    @Args('input', { type: () => UpdateMangaInput }) input: UpdateMangaInput,
  ): Promise<MangaType> {
    return await this.mangaService.update(id, input);
  }

  @Mutation(() => Boolean, {
    name: 'publishManga',
    description: 'Опубликовать мангу (сделать активной)'
  })
  async publishManga(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<boolean> {
    await this.mangaService.update(id, {} as any);
    return true;
  }

  @Mutation(() => Boolean, {
    name: 'hideManga',
    description: 'Скрыть мангу (сделать неактивной)'
  })
  async hideManga(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<boolean> {
    await this.mangaService.update(id, {} as any);
    return true;
  }

  @Mutation(() => Boolean, {
    name: 'featureManga',
    description: 'Добавить мангу в рекомендуемые'
  })
  async featureManga(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<boolean> {
    await this.mangaService.update(id, {} as any);
    return true;
  }

  @Mutation(() => Boolean, {
    name: 'unfeatureManga',
    description: 'Убрать мангу из рекомендуемых'
  })
  async unfeatureManga(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<boolean> {
    await this.mangaService.update(id, {} as any);
    return true;
  }

  @Mutation(() => Boolean, {
    name: 'updateMangaStock',
    description: 'Обновить количество манги на складе'
  })
  async updateMangaStock(
    @Args('id', { type: () => ID }) id: number,
    @Args('stock', { type: () => Int }) stock: number,
  ): Promise<boolean> {
    await this.mangaService.update(id, { stock });
    return true;
  }

  // Field Resolvers - для получения связанных данных
  @ResolveField(() => [ReviewType], { description: 'Отзывы о манге' })
  async reviews(@Parent() manga: MangaType): Promise<ReviewType[]> {
    const reviews = await this.reviewsService.findByMangaId(manga.id);
    return reviews.map(review => ({
      ...review,
      comment: review.comment || undefined,
    })) as ReviewType[];
  }

  @ResolveField(() => Int, { description: 'Количество отзывов' })
  async reviewsCount(@Parent() manga: MangaType): Promise<number> {
    const reviews = await this.reviewsService.findByMangaId(manga.id);
    return reviews.length;
  }

  @ResolveField(() => Int, { description: 'Средний рейтинг (умножен на 10)' })
  async averageRating(@Parent() manga: MangaType): Promise<number> {
    const reviews = await this.reviewsService.findByMangaId(manga.id);
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;
    return Math.round(average * 10); // Умножаем на 10 для точности
  }
}