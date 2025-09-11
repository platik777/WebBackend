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
  }): Promise<Manga[]> {
    const where: any = {};

    if (filters) {
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
              ],
            },
          },
        };
      }

      if (filters.priceMin !== undefined) {
        where.price = { ...where.price, gte: new Decimal(filters.priceMin) };
      }

      if (filters.priceMax !== undefined) {
        where.price = { ...where.price, lte: new Decimal(filters.priceMax) };
      }

      if (filters.inStock) {
        where.stock = { gt: 0 };
      }
    }

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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return mangas.map((manga) => new Manga(manga as MangaWithRelations));
  }

  async findOne(id: number): Promise<Manga | null> {
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

  async findFeatured(): Promise<Manga[]> {
    // Возвращаем последние 6 добавленных манг как "рекомендуемые"
    const mangas = await this.prisma.manga.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    });

    return mangas.map((manga) => new Manga(manga as MangaWithRelations));
  }

  async update(id: number, updateMangaDto: UpdateMangaDto): Promise<Manga> {
    const updateData: any = { ...updateMangaDto };

    if (updateData.price) {
      updateData.price = new Decimal(updateData.price);
    }

    // Убираем поля, которые не относятся напрямую к manga
    const { authorId, genreId, publisherId, ...mangaUpdateData } = updateData;

    const manga = await this.prisma.manga.update({
      where: { id },
      data: {
        ...mangaUpdateData,
        ...(publisherId && { publisherId }),
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

    return new Manga(manga as MangaWithRelations);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.manga.delete({
      where: { id },
    });
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    await this.prisma.manga.update({
      where: { id },
      data: { stock: { increment: quantity } },
    });
  }

  async reserveStock(id: number, quantity: number): Promise<boolean> {
    try {
      const manga = await this.findOne(id);
      if (!manga || !manga.canReserve(quantity)) {
        return false;
      }

      await this.prisma.manga.update({
        where: { id },
        data: { stock: { decrement: quantity } },
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async getMangaStats() {
    const [totalCount, inStockCount, avgPrice] = await Promise.all([
      this.prisma.manga.count(),
      this.prisma.manga.count({ where: { stock: { gt: 0 } } }),
      this.prisma.manga.aggregate({
        _avg: { price: true },
      }),
    ]);

    return {
      totalManga: totalCount,
      inStock: inStockCount,
      averagePrice: avgPrice._avg.price,
    };
  }

  // Поиск манги по названию
  async searchByTitle(query: string): Promise<Manga[]> {
    const mangas = await this.prisma.manga.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive',
        },
        isActive: true,
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
      orderBy: {
        title: 'asc',
      },
    });

    return mangas.map((manga) => new Manga(manga as MangaWithRelations));
  }

  // Получить похожие манги по жанрам
  async getSimilarManga(mangaId: number, limit: number = 4): Promise<Manga[]> {
    const manga = await this.prisma.manga.findUnique({
      where: { id: mangaId },
      include: {
        mangaGenres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!manga || !manga.mangaGenres.length) {
      return [];
    }

    const genreIds = manga.mangaGenres.map((mg) => mg.genreId);

    const similarMangas = await this.prisma.manga.findMany({
      where: {
        id: { not: mangaId },
        isActive: true,
        stock: { gt: 0 },
        mangaGenres: {
          some: {
            genreId: { in: genreIds },
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
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return similarMangas.map((manga) => new Manga(manga as MangaWithRelations));
  }
}
