import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  async findAll(@Query() filters: any) {
    return this.reviewsService.findAll(filters);
  }

  @Get('manga/:mangaId')
  async findByMangaId(@Param('mangaId', ParseIntPipe) mangaId: number) {
    return this.reviewsService.findByMangaId(mangaId);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.reviewsService.findByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewsService.findOne(id);
    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }
    return review;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    try {
      return await this.reviewsService.update(id, updateReviewDto);
    } catch (error) {
      throw new NotFoundException('Отзыв не найден');
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.reviewsService.remove(id);
      return { message: 'Отзыв успешно удален' };
    } catch (error) {
      throw new NotFoundException('Отзыв не найден');
    }
  }
}
