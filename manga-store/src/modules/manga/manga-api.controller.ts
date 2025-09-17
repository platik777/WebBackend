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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { MangaService } from './manga.service';
import { CreateMangaDto } from './dto/create-manga.dto';
import { UpdateMangaDto } from './dto/update-manga.dto';
import { MangaResponseDto } from './dto/manga-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('manga')
@Controller('api/manga')
export class MangaApiController {
  constructor(private readonly mangaService: MangaService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую мангу' })
  @ApiBody({ type: CreateMangaDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Манга успешно создана',
    type: MangaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  async create(@Body() createMangaDto: CreateMangaDto): Promise<MangaResponseDto> {
    const manga = await this.mangaService.create(createMangaDto);
    return new MangaResponseDto(manga);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список манги с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
  @ApiQuery({ name: 'genre', required: false, type: String, description: 'Фильтр по жанру' })
  @ApiQuery({ name: 'author', required: false, type: String, description: 'Фильтр по автору' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Поиск по названию' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список манги с пагинацией',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('genre') genre?: string,
    @Query('author') author?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedResponseDto<MangaResponseDto>> {
    const filters = { genre, author, search };
    return await this.mangaService.findAllPaginated(paginationQuery, filters);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Получить рекомендуемые манги' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список рекомендуемых манг',
    type: [MangaResponseDto],
  })
  async findFeatured(): Promise<MangaResponseDto[]> {
    const mangas = await this.mangaService.findFeatured();
    return mangas.map(manga => new MangaResponseDto(manga));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить мангу по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID манги' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Манга найдена',
    type: MangaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Манга не найдена',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MangaResponseDto> {
    const manga = await this.mangaService.findOne(id);
    return new MangaResponseDto(manga);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Получить отзывы о манге' })
  @ApiParam({ name: 'id', type: Number, description: 'ID манги' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Отзывы о манге',
    type: [MangaResponseDto],
  })
  async getReviews(@Param('id', ParseIntPipe) id: number) {
    return this.mangaService.getReviews(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить мангу' })
  @ApiParam({ name: 'id', type: Number, description: 'ID манги' })
  @ApiBody({ type: UpdateMangaDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Манга успешно обновлена',
    type: MangaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Манга не найдена',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMangaDto: UpdateMangaDto,
  ): Promise<MangaResponseDto> {
    const manga = await this.mangaService.update(id, updateMangaDto);
    return new MangaResponseDto(manga);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить мангу' })
  @ApiParam({ name: 'id', type: Number, description: 'ID манги' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Манга успешно удалена',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Манга успешно удалена' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Манга не найдена',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.mangaService.remove(id);
    return { message: 'Манга успешно удалена' };
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Обновить количество манги на складе' })
  @ApiParam({ name: 'id', type: Number, description: 'ID манги' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: { type: 'number', example: 10 },
      },
      required: ['quantity'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Склад обновлен',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Склад обновлен' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Манга не найдена',
  })
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    if (quantity < 0) {
      throw new BadRequestException('Количество не может быть отрицательным');
    }
    await this.mangaService.updateStock(id, quantity);
    return { message: 'Склад обновлен' };
  }
}