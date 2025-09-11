import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Manga } from './entities/manga.entity';
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

    return new Manga(mangaData);
  }

  async findAll(filters?: {
    genre?: string;
    author?: string;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
  }) {
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

    return mangas.map((manga) => new Manga(manga));
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

    return manga ? new Manga(manga) : null;
  }

  async findFeatured(): Promise<Manga[]> {
    // Возвращаем последние 6 добавленных манг как "рекомендуемые"
    const mangas = await this.prisma.manga.findMany({
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

    return mangas.map((manga) => new Manga(manga));
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

    return new Manga(manga);
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
}