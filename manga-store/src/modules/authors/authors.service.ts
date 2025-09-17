import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorResponseDto } from './dto/author-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const authorData = await this.prisma.author.create({
      data: {
        firstName: createAuthorDto.firstName,
        lastName: createAuthorDto.lastName,
        pseudonym: createAuthorDto.pseudonym,
        biography: createAuthorDto.biography,
        birthDate: createAuthorDto.birthDate ? new Date(createAuthorDto.birthDate) : null,
        nationality: createAuthorDto.nationality,
      },
    });

    return new Author(authorData);
  }

  async findAll(): Promise<Author[]> {
    const authors = await this.prisma.author.findMany({
      where: { isActive: true },
      orderBy: { lastName: 'asc' },
    });

    return authors.map((author) => new Author(author));
  }

  async findAllPaginated(
    paginationQuery: PaginationQueryDto,
    filters?: {
      search?: string;
    },
  ): Promise<PaginatedResponseDto<AuthorResponseDto>> {
    const options = PaginationUtil.buildPaginationOptions(paginationQuery);
    const { skip, take } = PaginationUtil.buildSkipTake(options);

    const where: any = { isActive: true };

    if (filters?.search) {
      where.OR = [
        {
          firstName: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          pseudonym: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [authors, total] = await Promise.all([
      this.prisma.author.findMany({
        where,
        skip,
        take,
        orderBy: { lastName: 'asc' },
        include: {
          _count: {
            select: {
              mangaAuthors: true,
            },
          },
        },
      }),
      this.prisma.author.count({ where }),
    ]);

    const authorResponses = authors.map((author) => {
      const authorEntity = new Author(author);
      const response = new AuthorResponseDto(authorEntity);
      response.worksCount = author._count.mangaAuthors;
      return response;
    });

    return PaginationUtil.buildPaginatedResponse(
      authorResponses,
      options,
      total,
      '/api/authors',
      { search: filters?.search },
    );
  }

  async findOne(id: number): Promise<Author> {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            mangaAuthors: true,
          },
        },
      },
    });

    if (!author) {
      throw new NotFoundException(`Автор с ID ${id} не найден`);
    }

    return new Author(author);
  }

  async getAuthorManga(id: number) {
    await this.findOne(id);

    return this.prisma.manga.findMany({
      where: {
        mangaAuthors: {
          some: {
            authorId: id,
          },
        },
        isActive: true,
      },
      include: {
        publisher: true,
        mangaGenres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    await this.findOne(id);

    const updateData: any = { ...updateAuthorDto };
    if (updateData.birthDate) {
      updateData.birthDate = new Date(updateData.birthDate);
    }

    const author = await this.prisma.author.update({
      where: { id },
      data: updateData,
    });

    return new Author(author);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.author.update({
      where: { id },
      data: { isActive: false },
    });
  }
}