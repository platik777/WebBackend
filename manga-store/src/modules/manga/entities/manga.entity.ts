import { Manga as PrismaManga } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

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

  constructor(partial: Partial<Manga>) {
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
