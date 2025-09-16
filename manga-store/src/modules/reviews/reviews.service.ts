import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    // Преобразуем строки в числа
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

    return review ? new Review(review) : null;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    // Преобразуем строки в числа при обновлении
    const updateData: any = {};

    if (updateReviewDto.rating) {
      updateData.rating = parseInt(updateReviewDto.rating.toString());
    }

    if (updateReviewDto.comment !== undefined) {
      updateData.comment = updateReviewDto.comment;
    }

    const review = await this.prisma.review.update({
      where: { id },
      data: updateData,
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
    await this.prisma.review.delete({
      where: { id },
    });
  }
}