import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Review, ReviewWithRelations } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const reviewData = await this.prisma.review.create({
      data: createReviewDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        manga: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
    });

    return new Review(reviewData as ReviewWithRelations);
  }

  async findAll(filters?: {
    mangaId?: number;
    userId?: number;
    rating?: number;
  }): Promise<Review[]> {
    const where: any = {};

    if (filters) {
      if (filters.mangaId) {
        where.mangaId = filters.mangaId;
      }
      if (filters.userId) {
        where.userId = filters.userId;
      }
      if (filters.rating) {
        where.rating = filters.rating;
      }
    }

    const reviews = await this.prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        manga: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map((review) => new Review(review as ReviewWithRelations));
  }

  async findOne(id: number): Promise<Review | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        manga: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
    });

    return review ? new Review(review as ReviewWithRelations) : null;
  }

  async findByMangaId(mangaId: number): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { mangaId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map(
      (review) =>
        new Review({
          ...review,
          manga: undefined, // Не включаем manga для этого метода
        } as ReviewWithRelations),
    );
  }

  async findByUserId(userId: number): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      include: {
        manga: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map(
      (review) =>
        new Review({
          ...review,
          user: undefined, // Не включаем user для этого метода
        } as ReviewWithRelations),
    );
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        manga: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
    });

    return new Review(review as ReviewWithRelations);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.review.delete({
      where: { id },
    });
  }

  async getAverageRatingForManga(mangaId: number): Promise<number> {
    const result = await this.prisma.review.aggregate({
      where: { mangaId },
      _avg: { rating: true },
    });

    return result._avg.rating || 0;
  }

  async getReviewsCountForManga(mangaId: number): Promise<number> {
    return this.prisma.review.count({
      where: { mangaId },
    });
  }

  // Получить топ отзывы (с высоким рейтингом)
  async getTopReviews(limit: number = 10): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: {
        rating: { gte: 4 },
        comment: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        manga: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return reviews.map((review) => new Review(review as ReviewWithRelations));
  }

  // Получить последние отзывы
  async getRecentReviews(limit: number = 5): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        manga: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return reviews.map((review) => new Review(review as ReviewWithRelations));
  }

  // Получить статистику отзывов для манги
  async getMangaReviewStats(mangaId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    const [avgResult, totalCount, distribution] = await Promise.all([
      this.prisma.review.aggregate({
        where: { mangaId },
        _avg: { rating: true },
      }),
      this.prisma.review.count({
        where: { mangaId },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { mangaId },
        _count: { rating: true },
        orderBy: { rating: 'asc' },
      }),
    ]);

    return {
      averageRating: Math.round((avgResult._avg.rating || 0) * 10) / 10,
      totalReviews: totalCount,
      ratingDistribution: distribution.map((item) => ({
        rating: item.rating,
        count: item._count.rating,
      })),
    };
  }
}
