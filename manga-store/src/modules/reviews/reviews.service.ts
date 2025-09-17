import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const reviewData = await this.prisma.review.create({
      data: {
        userId: parseInt(createReviewDto.userId?.toString() || '1'),
        mangaId: parseInt(createReviewDto.mangaId?.toString() || '1'),
        rating: parseInt(createReviewDto.rating?.toString() || '5'),
        comment: createReviewDto.comment || '',
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
    });

    return new Review(reviewData);
  }

  async findAll(filters: any): Promise<Review[]> {
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
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => new Review(review));
  }

  async findAllPaginated(
    paginationQuery: PaginationQueryDto,
    filters?: {
      mangaId?: number;
      userId?: number;
      rating?: number;
    },
  ): Promise<PaginatedResponseDto<ReviewResponseDto>> {
    const options = PaginationUtil.buildPaginationOptions(paginationQuery);
    const { skip, take } = PaginationUtil.buildSkipTake(options);

    const where: any = {};
    if (filters?.mangaId) {
      where.mangaId = filters.mangaId;
    }
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    if (filters?.rating) {
      where.rating = filters.rating;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.review.count({ where }),
    ]);

    const reviewResponses = reviews.map((review) => new ReviewResponseDto(new Review(review)));

    return PaginationUtil.buildPaginatedResponse(
      reviewResponses,
      options,
      total,
      '/api/reviews',
      { mangaId: filters?.mangaId, userId: filters?.userId, rating: filters?.rating },
    );
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
        manga: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => new Review(review));
  }

  async findByUserId(userId: number): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
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
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => new Review(review));
  }

  async findOne(id: number): Promise<Review> {
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

    if (!review) {
      throw new NotFoundException(`Отзыв с ID ${id} не найден`);
    }

    return new Review(review);
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    await this.findOne(id);

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

    return new Review(review);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.review.delete({
      where: { id },
    });
  }
}