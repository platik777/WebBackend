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
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorResponseDto } from './dto/author-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('authors')
@Controller('api/authors')
export class AuthorsApiController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать нового автора' })
  @ApiBody({ type: CreateAuthorDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Автор успешно создан',
    type: AuthorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  async create(@Body() createAuthorDto: CreateAuthorDto): Promise<AuthorResponseDto> {
    const author = await this.authorsService.create(createAuthorDto);
    return new AuthorResponseDto(author);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список авторов с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Поиск по имени автора' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список авторов с пагинацией',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('search') search?: string,
  ): Promise<PaginatedResponseDto<AuthorResponseDto>> {
    const filters = { search };
    return await this.authorsService.findAllPaginated(paginationQuery, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить автора по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID автора' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Автор найден',
    type: AuthorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Автор не найден',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AuthorResponseDto> {
    const author = await this.authorsService.findOne(id);
    return new AuthorResponseDto(author);
  }

  @Get(':id/manga')
  @ApiOperation({ summary: 'Получить мангу автора' })
  @ApiParam({ name: 'id', type: Number, description: 'ID автора' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Манга автора',
  })
  async getAuthorManga(@Param('id', ParseIntPipe) id: number) {
    return await this.authorsService.getAuthorManga(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить автора' })
  @ApiParam({ name: 'id', type: Number, description: 'ID автора' })
  @ApiBody({ type: UpdateAuthorDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Автор успешно обновлен',
    type: AuthorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Автор не найден',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<AuthorResponseDto> {
    const author = await this.authorsService.update(id, updateAuthorDto);
    return new AuthorResponseDto(author);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить автора' })
  @ApiParam({ name: 'id', type: Number, description: 'ID автора' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Автор успешно удален',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Автор успешно удален' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Автор не найден',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.authorsService.remove(id);
    return { message: 'Автор успешно удален' };
  }
}