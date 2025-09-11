import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Review } from './entities/review.entity';
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
          },
        },
      },
    });

    return new Review(reviewData);
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map((review) => new Review(review));
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
          },
        },
      },
    });

    return review ? new Review(review) : null;
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

    return reviews.map((review) => new Review(review));
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

    return reviews.map((review) => new Review(review));
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
          },
        },
      },
    });

    return new Review(review);
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
}
