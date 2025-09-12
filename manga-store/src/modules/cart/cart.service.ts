// src/modules/cart/cart.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MangaService } from '../manga/manga.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private mangaService: MangaService,
  ) {}

  async addItem(addToCartDto: AddToCartDto) {
    const { mangaId, quantity, sessionId } = addToCartDto;

    // Проверяем доступность манги
    const manga = await this.mangaService.findOne(mangaId);
    if (!manga) {
      throw new BadRequestException('Манга не найдена');
    }

    // Проверяем наличие на складе (используем обычные свойства вместо методов)
    if (!manga.isActive || manga.stock < quantity) {
      throw new BadRequestException('Недостаточно товара на складе');
    }

    // Ищем существующий товар в корзине
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        mangaId,
        sessionId,
      },
    });

    if (existingItem) {
      // Обновляем количество
      const newQuantity = existingItem.quantity + quantity;
      if (manga.stock < newQuantity) {
        throw new BadRequestException('Недостаточно товара на складе');
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          manga: {
            select: {
              id: true,
              title: true,
              price: true,
              imageUrl: true,
              stock: true,
              isActive: true,
            },
          },
        },
      });
    } else {
      // Создаем новый элемент корзины
      return this.prisma.cartItem.create({
        data: {
          mangaId,
          quantity,
          sessionId,
          price: manga.price,
        },
        include: {
          manga: {
            select: {
              id: true,
              title: true,
              price: true,
              imageUrl: true,
              stock: true,
              isActive: true,
            },
          },
        },
      });
    }
  }

  async getCartBySession(sessionId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { sessionId },
      include: {
        manga: {
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return cartItems;
  }

  async updateItem(itemId: number, updateCartItemDto: UpdateCartItemDto) {
    const { quantity } = updateCartItemDto;

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        manga: {
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
            stock: true,
            isActive: true,
          },
        },
      },
    });

    if (!cartItem) {
      throw new BadRequestException('Товар в корзине не найден');
    }

    // Проверяем доступность
    if (!cartItem.manga.isActive || cartItem.manga.stock < quantity) {
      throw new BadRequestException('Недостаточно товара на складе');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        manga: {
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
            stock: true,
            isActive: true,
          },
        },
      },
    });
  }

  async removeItem(itemId: number) {
    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(sessionId: string) {
    await this.prisma.cartItem.deleteMany({
      where: { sessionId },
    });
  }

  async getCartSummary(sessionId: string) {
    const cartItems = await this.getCartBySession(sessionId);

    const summary = cartItems.reduce(
      (acc, item) => {
        const itemTotal = item.manga.price.toNumber() * item.quantity;
        acc.totalItems += item.quantity;
        acc.totalAmount += itemTotal;

        if (item.manga.isActive && item.manga.stock >= item.quantity) {
          acc.availableItems += item.quantity;
          acc.availableAmount += itemTotal;
        } else {
          acc.unavailableItems.push({
            id: item.id,
            title: item.manga.title,
            requestedQuantity: item.quantity,
            availableStock: item.manga.stock,
          });
        }

        return acc;
      },
      {
        totalItems: 0,
        totalAmount: 0,
        availableItems: 0,
        availableAmount: 0,
        unavailableItems: [] as any[],
        shippingCost: 0, // Бесплатная доставка
      },
    );

    // Логика расчета доставки
    if (summary.availableAmount < 1000) {
      summary.shippingCost = 300; // Платная доставка для заказов менее 1000 руб
    }

    return {
      ...summary,
      finalAmount: summary.availableAmount + summary.shippingCost,
    };
  }

  async checkout(sessionId: string, checkoutData: any) {
    const cartItems = await this.getCartBySession(sessionId);

    if (cartItems.length === 0) {
      throw new BadRequestException('Корзина пуста');
    }

    // Проверяем доступность всех товаров
    for (const item of cartItems) {
      if (!item.manga.isActive || item.manga.stock < item.quantity) {
        throw new BadRequestException(
          `Товар "${item.manga.title}" недоступен в нужном количестве`,
        );
      }
    }

    // Создаем заказ через метод createGuestOrder
    const orderData = {
      userId: checkoutData.userId || null,
      items: cartItems.map((item) => ({
        mangaId: item.mangaId,
        quantity: item.quantity,
        price: item.manga.price.toNumber(),
      })),
      shippingAddress: checkoutData.shippingAddress,
      shippingCity: checkoutData.shippingCity,
      shippingPhone: checkoutData.shippingPhone,
      customerEmail: checkoutData.email,
      customerFirstName: checkoutData.firstName,
      customerLastName: checkoutData.lastName,
    };

    // Используем транзакцию для атомарности операции
    const result = await this.prisma.$transaction(async (tx) => {
      // Создаем заказ
      const order = await this.createOrder(orderData, tx);

      // Резервируем товары на складе
      for (const item of cartItems) {
        await this.reserveStock(item.mangaId, item.quantity, tx);
      }

      // Очищаем корзину
      await tx.cartItem.deleteMany({
        where: { sessionId },
      });

      return order;
    });

    return result;
  }

  // Приватный метод для создания заказа
  private async createOrder(orderData: any, tx?: any) {
    const prismaClient = tx || this.prisma;

    // Рассчитываем общую сумму заказа
    const totalAmount = orderData.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Генерируем номер заказа
    const orderNumber = this.generateOrderNumber();

    const order = await prismaClient.order.create({
      data: {
        orderNumber,
        status: 'PENDING',
        totalAmount: new Decimal(totalAmount),
        userId: orderData.userId,
        shippingAddress: orderData.shippingAddress,
        shippingCity: orderData.shippingCity,
        shippingPhone: orderData.shippingPhone,
        customerEmail: orderData.customerEmail,
        customerFirstName: orderData.customerFirstName,
        customerLastName: orderData.customerLastName,
        orderItems: {
          create: orderData.items.map((item) => ({
            mangaId: item.mangaId,
            quantity: item.quantity,
            price: new Decimal(item.price),
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            manga: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return order;
  }

  // Приватный метод для резервирования товара
  private async reserveStock(mangaId: number, quantity: number, tx?: any) {
    const prismaClient = tx || this.prisma;

    const manga = await prismaClient.manga.findUnique({
      where: { id: mangaId },
    });

    if (!manga || manga.stock < quantity) {
      throw new BadRequestException(`Недостаточно товара на складе для манги с ID ${mangaId}`);
    }

    await prismaClient.manga.update({
      where: { id: mangaId },
      data: { stock: { decrement: quantity } },
    });
  }

  // Приватный метод для генерации номера заказа
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORDER-${timestamp}-${random}`;
  }
}