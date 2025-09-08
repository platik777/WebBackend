import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Author } from './entities/author.entity';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Author[]> {
    const authors = await this.prisma.author.findMany({
      orderBy: { lastName: 'asc' },
    });

    return authors.map((author) => new Author(author));
  }

  async findOne(id: number): Promise<Author | null> {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: {
        mangas: {
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
          },
        },
      },
    });

    return author ? new Author(author) : null;
  }
}
