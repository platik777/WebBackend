import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Render,
  Redirect,
  Sse,
  MessageEvent,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Observable, interval, map, switchMap, catchError, of } from 'rxjs';

@Controller('reviews-admin')
export class ReviewsWebController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @Render('reviews-admin/index')
  async index() {
    const reviews = await this.reviewsService.findAll({});

    return {
      title: 'Управление отзывами',
      reviews: reviews.slice(0, 10).map((review) => {
        const reviewData = review as any;
        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment || 'Без комментария',
          userName: reviewData.user
            ? `${reviewData.user.firstName} ${reviewData.user.lastName}`
            : 'Аноним',
          mangaTitle: reviewData.manga?.title || 'Неизвестная манга',
          createdAt: review.createdAt.toLocaleDateString('ru-RU'),
        };
      }),
    };
  }

  @Get('add')
  @Render('reviews-admin/create')
  async create() {
    return {
      title: 'Добавить отзыв',
    };
  }

  @Post('add')
  @Redirect('/reviews-admin')
  async store(@Body() createReviewDto: CreateReviewDto) {
    await this.reviewsService.create(createReviewDto);
  }

  @Get(':id/edit')
  @Render('reviews-admin/edit')
  async edit(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewsService.findOne(id);

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    const reviewData = review as any;

    return {
      title: 'Редактировать отзыв',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        mangaTitle: reviewData.manga?.title || 'Неизвестная манга',
      },
    };
  }

  @Post(':id/edit')
  @Redirect('/reviews-admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    await this.reviewsService.update(id, data);
  }

  @Post(':id/delete')
  @Redirect('/reviews-admin')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.reviewsService.remove(id);
  }

  @Sse('events')
  sendReviewUpdates(): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(async () => {
        try {
          const reviews = await this.reviewsService.findAll({});
          const totalReviews = reviews.length;
          const averageRating =
            reviews.length > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
              : 0;

          return {
            data: JSON.stringify({
              type: 'review_update',
              timestamp: new Date().toISOString(),
              stats: {
                total: totalReviews,
                averageRating: Number(averageRating.toFixed(1)),
              },
              lastReview:
                reviews.length > 0
                  ? {
                    id: reviews[0].id,
                    rating: reviews[0].rating,
                    createdAt: reviews[0].createdAt.toISOString(),
                  }
                  : null,
            }),
          };
        } catch (error) {
          console.error('SSE Error:', error);
          return {
            data: JSON.stringify({
              type: 'error',
              message: 'Ошибка получения данных',
            }),
          };
        }
      }),
      map((data) => data as MessageEvent),
      catchError(() =>
        of({
          data: JSON.stringify({ type: 'error', message: 'Ошибка соединения' }),
        } as MessageEvent),
      ),
    );
  }
}