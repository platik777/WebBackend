import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Текущая страница', example: 1 })
  currentPage: number;

  @ApiProperty({ description: 'Элементов на странице', example: 10 })
  perPage: number;

  @ApiProperty({ description: 'Общее количество элементов', example: 100 })
  total: number;

  @ApiProperty({ description: 'Общее количество страниц', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Есть ли следующая страница', example: true })
  hasNext: boolean;

  @ApiProperty({ description: 'Есть ли предыдущая страница', example: false })
  hasPrev: boolean;

  @ApiProperty({ description: 'Ссылка на следующую страницу', example: 'http://localhost:3000/api/manga?page=2&limit=10', required: false })
  nextPage?: string;

  @ApiProperty({ description: 'Ссылка на предыдущую страницу', example: null, required: false })
  prevPage?: string;
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty({ description: 'Массив данных' })
  data: T[];

  @ApiProperty({ description: 'Метаданные пагинации', type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}