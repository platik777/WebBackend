import { Decimal } from '@prisma/client/runtime/library';

export interface MangaWithRelations {
  id: number;
  title: string;
  description?: string | null;
  isbn?: string | null;
  price: Decimal;
  discountPrice?: Decimal | null;
  stock: number;
  pages?: number | null;
  language: string;
  imageUrl?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  publishDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  publisher?: {
    id: number;
    name: string;
    description?: string | null;
    country?: string | null;
    website?: string | null;
    isActive: boolean;
  };
  mangaAuthors?: {
    author: {
      id: number;
      firstName: string;
      lastName: string;
      pseudonym?: string | null;
    };
  }[];
  mangaGenres?: {
    genre: {
      id: number;
      name: string;
      description?: string | null;
    };
  }[];
}

export class Manga {
  id: number;
  title: string;
  description?: string;
  isbn?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  pages?: number;
  language: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  publishDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  publisher?: {
    id: number;
    name: string;
    description?: string;
    country?: string;
    website?: string;
    isActive: boolean;
  };
  authors: {
    id: number;
    firstName: string;
    lastName: string;
    pseudonym?: string;
    displayName: string;
  }[];
  genres: {
    id: number;
    name: string;
    description?: string;
  }[];

  constructor(data: MangaWithRelations) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description || undefined;
    this.isbn = data.isbn || undefined;
    this.price = data.price.toNumber();
    this.discountPrice = data.discountPrice?.toNumber();
    this.stock = data.stock;
    this.pages = data.pages || undefined;
    this.language = data.language;
    this.imageUrl = data.imageUrl || undefined;
    this.isActive = data.isActive;
    this.isFeatured = data.isFeatured;
    this.publishDate = data.publishDate || undefined;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    if (data.publisher) {
      this.publisher = {
        id: data.publisher.id,
        name: data.publisher.name,
        description: data.publisher.description || undefined,
        country: data.publisher.country || undefined,
        website: data.publisher.website || undefined,
        isActive: data.publisher.isActive,
      };
    }

    this.authors = data.mangaAuthors?.map((ma) => ({
      id: ma.author.id,
      firstName: ma.author.firstName,
      lastName: ma.author.lastName,
      pseudonym: ma.author.pseudonym || undefined,
      displayName: ma.author.pseudonym || `${ma.author.firstName} ${ma.author.lastName}`,
    })) || [];

    this.genres = data.mangaGenres?.map((mg) => ({
      id: mg.genre.id,
      name: mg.genre.name,
      description: mg.genre.description || undefined,
    })) || [];
  }

  get isAvailable(): boolean {
    return this.isActive && this.stock > 0;
  }
}