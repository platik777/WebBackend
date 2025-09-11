import { Manga as PrismaManga, MangaAuthor, MangaGenre, Publisher, OrderItem, Review, Author, Genre } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Тип для Manga с включенными связями
export type MangaWithRelations = PrismaManga & {
  publisher?: Publisher;
  mangaAuthors?: (MangaAuthor & {
    author: Author;
  })[];
  mangaGenres?: (MangaGenre & {
    genre: Genre;
  })[];
  orderItems?: OrderItem[];
  reviews?: (Review & {
    user?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  })[];
};

export class Manga implements PrismaManga {
  id: number;
  title: string;
  description: string | null;
  isbn: string | null;
  price: Decimal;
  discountPrice: Decimal | null;
  stock: number;
  pages: number | null;
  language: string;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  publishDate: Date | null;
  publisherId: number;
  createdAt: Date;
  updatedAt: Date;

  // Дополнительные поля для связей (будут заполнены через Prisma include)
  publisher?: Publisher;
  mangaAuthors?: (MangaAuthor & {
    author: Author;
  })[];
  mangaGenres?: (MangaGenre & {
    genre: Genre;
  })[];
  orderItems?: OrderItem[];
  reviews?: (Review & {
    user?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  })[];

  constructor(partial: Partial<MangaWithRelations>) {
    Object.assign(this, partial);
  }

  // Доменная логика
  get isAvailable(): boolean {
    return this.isActive && this.stock > 0;
  }

  get currentPrice(): Decimal {
    return this.discountPrice && this.discountPrice.lt(this.price)
      ? this.discountPrice
      : this.price;
  }

  get hasDiscount(): boolean {
    return this.discountPrice !== null && this.discountPrice.lt(this.price);
  }

  get discountPercentage(): number {
    if (!this.hasDiscount) return 0;

    const discount = this.price.sub(this.discountPrice!);
    return discount.div(this.price).mul(100).toNumber();
  }

  // Получить основного автора
  get primaryAuthor(): string {
    if (!this.mangaAuthors || this.mangaAuthors.length === 0) {
      return 'Неизвестен';
    }

    const author = this.mangaAuthors[0].author;
    return author.pseudonym || `${author.firstName} ${author.lastName}`;
  }

  // Получить список жанров
  get genresList(): string[] {
    if (!this.mangaGenres) return [];
    return this.mangaGenres.map(mg => mg.genre.name);
  }

  // Получить строку жанров
  get genresString(): string {
    return this.genresList.join(', ') || '';
  }

  // Получить средний рейтинг
  get averageRating(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;

    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / this.reviews.length) * 10) / 10;
  }

  // Получить количество отзывов
  get reviewsCount(): number {
    return this.reviews?.length || 0;
  }

  canReserve(quantity: number): boolean {
    return this.isAvailable && this.stock >= quantity;
  }

  reserveStock(quantity: number): void {
    if (!this.canReserve(quantity)) {
      throw new Error(
        `Недостаточно товара на складе. Доступно: ${this.stock}, запрошено: ${quantity}`,
      );
    }
    this.stock -= quantity;
  }

  restoreStock(quantity: number): void {
    this.stock += quantity;
  }

  updatePrice(newPrice: Decimal, discountPrice?: Decimal): void {
    if (newPrice.lte(0)) {
      throw new Error('Цена должна быть больше нуля');
    }

    this.price = newPrice;

    if (discountPrice) {
      if (discountPrice.gte(newPrice)) {
        throw new Error(
          'Цена со скидкой не может быть больше или равна базовой цене',
        );
      }
      this.discountPrice = discountPrice;
    }
  }
}