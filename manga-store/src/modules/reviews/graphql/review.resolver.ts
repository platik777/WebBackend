import { Resolver, Query, Mutation, Args, ResolveField, Parent, Int, ID } from '@nestjs/graphql';
import { ValidationPipe, UsePipes } from '@nestjs/common';
import { ReviewsService } from '../reviews.service';
import { MangaService } from '../../manga/manga.service';
import { ReviewType, ReviewStatsType } from './review.types';
import { MangaType } from '../../manga/graphql/manga.types';
import { CreateReviewInput, UpdateReviewInput, ReviewFiltersInput } from './review.inputs';

@Resolver(() => ReviewType)
export class ReviewResolver {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly mangaService: MangaService,
  ) {}

  @Query(() => [ReviewType], {
    name: 'reviews',
    description: 'Получить список отзывов с фильтрацией'
  })
  async getReviews(
    @Args('filters', { type: () => ReviewFiltersInput, nullable: true })
      filters?: ReviewFiltersInput,
  ): Promise<ReviewType[]> {
    const reviews = await this.reviewsService.findAll({
      mangaId: filters?.mangaId,
      userId: filters?.userId,
      rating: filters?.rating,
      minRating: filters?.minRating,
    });

    return reviews.map(review => ({
      ...review,
      comment: review.comment || undefined,
    })) as ReviewType[];
  }

  @Query(() => ReviewType, {
    name: 'reviewById',
    description: 'Получить отзыв по ID'
  })
  async getReviewById(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<ReviewType> {
    const review = await this.reviewsService.findOne(id);
    return {
      ...review,
      comment: review.comment || undefined,
    } as ReviewType;
  }

  @Query(() => [ReviewType], {
    name: 'reviewsByManga',
    description: 'Получить все отзывы для конкретной манги'
  })
  async getReviewsByManga(
    @Args('mangaId', { type: () => ID }) mangaId: number,
  ): Promise<ReviewType[]> {
    const reviews = await this.reviewsService.findByMangaId(mangaId);
    return reviews.map(review => ({
      ...review,
      comment: review.comment || undefined,
    })) as ReviewType[];
  }

  @Query(() => [ReviewType], {
    name: 'reviewsByUser',
    description: 'Получить все отзывы конкретного пользователя'
  })
  async getReviewsByUser(
    @Args('userId', { type: () => ID }) userId: number,
  ): Promise<ReviewType[]> {
    const reviews = await this.reviewsService.findByUserId(userId);
    return reviews.map(review => ({
      ...review,
      comment: review.comment || undefined,
    })) as ReviewType[];
  }

  @Query(() => [ReviewType], {
    name: 'topReviews',
    description: 'Получить отзывы с высоким рейтингом'
  })
  async getTopReviews(
    @Args('minRating', { type: () => Int, defaultValue: 4 }) minRating: number,
  ): Promise<ReviewType[]> {
    const reviews = await this.reviewsService.findAll({ minRating });
    return reviews.map(review => ({
      ...review,
      comment: review.comment || undefined,
    })) as ReviewType[];
  }

  @Query(() => ReviewStatsType, {
    name: 'reviewStats',
    description: 'Получить статистику отзывов для конкретной манги'
  })
  async getReviewStats(
    @Args('mangaId', { type: () => ID }) mangaId: number,
  ): Promise<ReviewStatsType> {
    const reviews = await this.reviewsService.findByMangaId(mangaId);

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10)
      : 0;

    // Подсчитываем распределение рейтингов [1, 2, 3, 4, 5]
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating =>
      reviews.filter(review => review.rating === rating).length
    );

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
    };
  }

  @Mutation(() => ReviewType, {
    name: 'createReview',
    description: 'Создать новый отзыв'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createReview(
    @Args('input', { type: () => CreateReviewInput })
      input: CreateReviewInput,
  ): Promise<ReviewType> {
    const review = await this.reviewsService.create({
      rating: input.rating,
      comment: input.comment,
      userId: input.userId,
      mangaId: input.mangaId,
    });

    return {
      ...review,
      comment: review.comment || undefined,
    } as ReviewType;
  }

  @Mutation(() => ReviewType, {
    name: 'updateReview',
    description: 'Обновить существующий отзыв'
  })
  async updateReview(
    @Args('id', { type: () => ID }) id: number,
    @Args('input', { type: () => UpdateReviewInput }) input: UpdateReviewInput,
  ): Promise<ReviewType> {
    const review = await this.reviewsService.update(id, input);
    return {
      ...review,
      comment: review.comment || undefined,
    } as ReviewType;
  }

  @Mutation(() => Boolean, {
    name: 'deleteReview',
    description: 'Удалить отзыв'
  })
  async deleteReview(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<boolean> {
    await this.reviewsService.remove(id);
    return true;
  }

  // Field Resolvers - для получения связанных данных
  @ResolveField(() => MangaType, { description: 'Информация о манге' })
  async manga(@Parent() review: ReviewType): Promise<MangaType> {
    return await this.mangaService.findOne(review.mangaId);
  }
}