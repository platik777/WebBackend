import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Manga, MangaWithRelations } from './entities/manga.entity';
import { CreateMangaDto } from './dto/create-manga.dto';
import { UpdateMangaDto } from './dto/update-manga.dto';
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
  }): Promise<Manga[]> {
    const where: any = {
      isActive: true, // Только активные манги
    };

    if (filters) {
      // Фильтр по жанру
      if (filters.genre) {
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

      // Фильтр по автору
      if (filters.author) {
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
                  displayName: {
                    contains: filters.author,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        };
      }

      // Фильтры по цене
      if (filters.priceMin !== undefined) {
        where.price = { ...where.price, gte: new Decimal(filters.priceMin) };
      }
      if (filters.priceMax !== undefined) {
        where.price = { ...where.price, lte: new Decimal(filters.priceMax) };
      }

      // Фильтр по наличию
      if (filters.inStock !== undefined) {
        if (filters.inStock) {
          where.stock = { gt: 0 };
        } else {
          where.stock = { lte: 0 };
        }
      }

      // Поиск по названию и описанию
      if (filters.search) {
        where.OR = [
          {
            title: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        ];
      }
    }

    // Определяем сортировку
    const orderBy = this.buildOrderBy(filters?.sort);

    const mangas = await this.prisma.manga.findMany({
      where,
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
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy,
    });

    return mangas.map((manga) => new Manga(manga as MangaWithRelations));
  }

  /**
   * Построить объект сортировки на основе параметра sort
   */
  private buildOrderBy(sort?: string): any {
    if (!sort) {
      return { createdAt: 'desc' }; // По умолчанию сортируем по дате создания
    }

    switch (sort) {
      case 'title-asc':
        return { title: 'asc' };
      case 'title-desc':
        return { title: 'desc' };
      case 'price-asc':
        return { price: 'asc' };
      case 'price-desc':
        return { price: 'desc' };
      case 'author-asc':
        return [
          { mangaAuthors: { author: { lastName: 'asc' } } },
          { mangaAuthors: { author: { firstName: 'asc' } } }
        ];
      case 'author-desc':
        return [
          { mangaAuthors: { author: { lastName: 'desc' } } },
          { mangaAuthors: { author: { firstName: 'desc' } } }
        ];
      case 'newest':
        return { createdAt: 'desc' };
      case 'oldest':
        return { createdAt: 'asc' };
      case 'rating':
        // Сортировка по рейтингу требует более сложного запроса
        return { createdAt: 'desc' }; // Временно по дате
      default:
        return { createdAt: 'desc' };
    }
  }

  async findOne(id: number): Promise<Manga | null> {
    const manga = await this.prisma.manga.findUnique({
      where: {
        id,
        isActive: true, // Только активные манги
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
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return manga ? new Manga(manga as MangaWithRelations) : null;
  }

  async findFeatured(limit: number = 8): Promise<Manga[]> {
    const mangas = await this.prisma.manga.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 }, // Только в наличии
        isFeatured: true, // Предполагаем, что есть поле isFeatured
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
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Если нет рекомендуемых, возвращаем последние добавленные в наличии
    if (mangas.length === 0) {
      const fallbackMangas = await this.prisma.manga.findMany({
        where: {
          isActive: true,
          stock: { gt: 0 },
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
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return fallbackMangas.map((manga) => new Manga(manga as MangaWithRelations));
    }

    return mangas.map((manga) => new Manga(manga as MangaWithRelations));
  }

  async update(id: number, updateMangaDto: UpdateMangaDto): Promise<Manga> {
    const mangaData = await this.prisma.manga.update({
      where: { id },
      data: {
        title: updateMangaDto.title,
        description: updateMangaDto.description,
        price: updateMangaDto.price ? new Decimal(updateMangaDto.price) : undefined,
        stock: updateMangaDto.stock,
        imageUrl: updateMangaDto.imageUrl,
        publisherId: updateMangaDto.publisherId,
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

  async remove(id: number): Promise<void> {
    // Мягкое удаление - помечаем как неактивную
    await this.prisma.manga.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    await this.prisma.manga.update({
      where: { id },
      data: {
        stock: quantity,
      },
    });
  }
}