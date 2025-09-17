import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('reviews')
@Controller('api/reviews')
export class ReviewsApiController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый отзыв' })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Отзыв успешно создан',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  async create(@Body() createReviewDto: CreateReviewDto): Promise<ReviewResponseDto> {
    const review = await this.reviewsService.create(createReviewDto);
    return new ReviewResponseDto(review);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список отзывов с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
  @ApiQuery({ name: 'mangaId', required: false, type: Number, description: 'ID манги для фильтрации' })
  @ApiQuery({ name: 'userId', required: false, type: Number, description: 'ID пользователя для фильтрации' })
  @ApiQuery({ name: 'rating', required: false, type: Number, description: 'Фильтр по рейтингу' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список отзывов с пагинацией',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('mangaId') mangaId?: number,
    @Query('userId') userId?: number,
    @Query('rating') rating?: number,
  ): Promise<PaginatedResponseDto<ReviewResponseDto>> {
    const filters = { mangaId, userId, rating };
    return await this.reviewsService.findAllPaginated(paginationQuery, filters);
  }

  @Get('manga/:mangaId')
  @ApiOperation({ summary: 'Получить отзывы о манге' })
  @ApiParam({ name: 'mangaId', type: Number, description: 'ID манги' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Отзывы о манге',
    type: [ReviewResponseDto],
  })
  async findByMangaId(@Param('mangaId', ParseIntPipe) mangaId: number): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewsService.findByMangaId(mangaId);
    return reviews.map(review => new ReviewResponseDto(review));
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Получить отзывы пользователя' })
  @ApiParam({ name: 'userId', type: Number, description: 'ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Отзывы пользователя',
    type: [ReviewResponseDto],
  })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewsService.findByUserId(userId);
    return reviews.map(review => new ReviewResponseDto(review));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить отзыв по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID отзыва' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Отзыв найден',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Отзыв не найден',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ReviewResponseDto> {
    const review = await this.reviewsService.findOne(id);
    return new ReviewResponseDto(review);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить отзыв' })
  @ApiParam({ name: 'id', type: Number, description: 'ID отзыва' })
  @ApiBody({ type: UpdateReviewDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Отзыв успешно обновлен',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Отзыв не найден',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsService.update(id, updateReviewDto);
    return new ReviewResponseDto(review);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить отзыв' })
  @ApiParam({ name: 'id', type: Number, description: 'ID отзыва' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Отзыв успешно удален',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Отзыв успешно удален' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Отзыв не найден',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.reviewsService.remove(id);
    return { message: 'Отзыв успешно удален' };
  }
}