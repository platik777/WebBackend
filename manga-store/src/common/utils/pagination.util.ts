import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../dto/paginated-response.dto';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMetaDto;
}

export class PaginationUtil {
  static buildPaginationOptions(query: PaginationQueryDto): PaginationOptions {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));

    return { page, limit };
  }

  static buildSkipTake(options: PaginationOptions): { skip: number; take: number } {
    const skip = (options.page - 1) * options.limit;
    const take = options.limit;

    return { skip, take };
  }

  static buildPaginationMeta(
    options: PaginationOptions,
    total: number,
    baseUrl: string,
    queryParams?: Record<string, any>,
  ): PaginationMetaDto {
    const totalPages = Math.ceil(total / options.limit);
    const hasNext = options.page < totalPages;
    const hasPrev = options.page > 1;

    const buildUrl = (page: number): string => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', options.limit.toString());

      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.set(key, value.toString());
          }
        });
      }

      return `${baseUrl}?${params.toString()}`;
    };

    return {
      currentPage: options.page,
      perPage: options.limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      nextPage: hasNext ? buildUrl(options.page + 1) : undefined,
      prevPage: hasPrev ? buildUrl(options.page - 1) : undefined,
    };
  }

  static buildPaginatedResponse<T>(
    data: T[],
    options: PaginationOptions,
    total: number,
    baseUrl: string,
    queryParams?: Record<string, any>,
  ): PaginatedResponseDto<T> {
    const meta = this.buildPaginationMeta(options, total, baseUrl, queryParams);
    return new PaginatedResponseDto(data, meta);
  }
}