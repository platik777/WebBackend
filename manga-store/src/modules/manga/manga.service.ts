import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Manga, MangaWithRelations } from './entities/manga.entity';
import { CreateMangaDto } from './dto/create-manga.dto';
import { UpdateMangaDto } from './dto/update-manga.dto';
import { MangaResponseDto } from './dto/manga-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class MangaService {
  constructor(private prisma: PrismaService) {}

  async create(createMangaDto: CreateMangaDto): Promise<Manga> {
    const mangaData = await this.prisma.manga.create({
      data: {
        title: createMangaDto.title,
        description: createMangaDto.description,
        price: new Decimal(createMangaDto.price),
        stock: createMangaDto.stock,
        imageUrl: createMangaDto.imageUrl,
        publisherId: createMangaDto.publisherId,
        mangaAuthors: {
          create: {
            authorId: createMangaDto.authorId,
          },
        },
        mangaGenres: {
          create: {
            genreId: createMangaDto.genreId,
          },
        },
      },
      include: {
        publisher: true,
        mangaAuthors: {
          include: {
            author: true,
          },
        },
        mangaGenres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return new Manga(mangaData as MangaWithRelations);
  }

  async findAll(filters?: {
    genre?: string;
    author?: string;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<Manga[]> {
    const where: any = { isActive: true };

    if (filters?.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters?.genre) {
      where.mangaGenres = {
        some: {
          genre: {
            name: {
              contains: filters.genre,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    if (filters?.author) {
      where.mangaAuthors = {
        some: {
          author: {
            OR: [
              {
                firstName: {
                  contains: filters.author,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: filters.author,
                  mode: 'insensitive',
                },
              },
              {
                pseudonym: {
                  contains: filters.author,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      };
    }

    if (filters?.priceMin !== undefined || filters?.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) {
        where.price.gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        where.price.lte = filters.priceMax;
      }
    }

    if (filters?.inStock) {
      where.stock = { gt: 0 };
    }

    const orderBy: any = {};
    if (filters?.sort) {
      orderBy[filters.sort] = filters.order || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const mangas = await this.prisma.manga.findMany({
      where,
      orderBy,
      include: {
        publisher: true,
        mangaAuthors: {
          include: {
            author: true,
          },
        },
        mangaGenres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return mangas.map((manga) => new Manga(manga as MangaWithRelations));
  }

  async findAllPaginated(
    paginationQuery: PaginationQueryDto,
    filters?: {
      genre?: string;
      author?: string;
      search?: string;
    },
  ): Promise<PaginatedResponseDto<MangaResponseDto>> {
    const options = PaginationUtil.buildPaginationOptions(paginationQuery);
    const { skip, take } = PaginationUtil.buildSkipTake(options);

    const where: any = { isActive: true };

    if (filters?.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters?.genre) {
      where.mangaGenres = {
        some: {
          genre: {
            name: {
              contains: filters.genre,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    if (filters?.author) {
      where.mangaAuthors = {
        some: {
          author: {
            OR: [
              {
                firstName: {
                  contains: filters.author,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: filters.author,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      };
    }

    const [mangas, total] = await Promise.all([
      this.prisma.manga.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          publisher: true,
          mangaAuthors: {
            include: {
              author: true,
            },
          },
          mangaGenres: {
            include: {
              genre: true,
            },
          },
        },
      }),
      this.prisma.manga.count({ where }),
    ]);

    const mangaEntities = mangas.map((manga) => new Manga(manga as MangaWithRelations));
    const mangaResponses = mangaEntities.map((manga) => new MangaResponseDto(manga));

    return PaginationUtil.buildPaginatedResponse(
      mangaResponses,
      options,
      total,
      '/api/manga',
      { genre: filters?.genre, author: filters?.author, search: filters?.search },
    );
  }

  async findFeatured(): Promise<Manga[]> {
    const mangas = await this.prisma.manga.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        publisher: true,
        mangaAuthors: {
          include: {
            author: true,
          },
        },
        mangaGenres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return mangas.map((manga) => new Manga(manga as MangaWithRelations));
  }

  async findOne(id: number): Promise<Manga> {
    const manga = await this.prisma.manga.findUnique({
      where: { id },
      include: {
        publisher: true,
        mangaAuthors: {
          include: {
            author: true,
          },
        },
        mangaGenres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!manga) {
      throw new NotFoundException(`Манга с ID ${id} не найдена`);
    }

    return new Manga(manga as MangaWithRelations);
  }

  async getReviews(id: number) {
    const manga = await this.findOne(id);

    return this.prisma.review.findMany({
      where: { mangaId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, updateMangaDto: UpdateMangaDto): Promise<Manga> {
    await this.findOne(id);

    const updateData: any = { ...updateMangaDto };
    if (updateData.price) {
      updateData.price = new Decimal(updateData.price);
    }

    const manga = await this.prisma.manga.update({
      where: { id },
      data: updateData,
      include: {
        publisher: true,
        mangaAuthors: {
          include: {
            author: true,
          },
        },
        mangaGenres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return new Manga(manga as MangaWithRelations);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.manga.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.manga.update({
      where: { id },
      data: { stock: quantity },
    });
  }
}