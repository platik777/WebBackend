import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Order, OrderWithRelations } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Рассчитываем общую сумму заказа
    const totalAmount = createOrderDto.items.reduce((total, item) => {
      return total.add(new Decimal(item.price).mul(item.quantity));
    }, new Decimal(0));

    // Генерируем номер заказа
    const orderNumber = Order.generateOrderNumber();

    const orderData = await this.prisma.order.create({
      data: {
        orderNumber,
        status: 'PENDING',
        totalAmount,
        userId: createOrderDto.userId,
        shippingAddress: createOrderDto.shippingAddress,
        shippingCity: createOrderDto.shippingCity,
        shippingPhone: createOrderDto.shippingPhone,
        // Добавляем поля для гостевых заказов
        customerEmail: createOrderDto.customerEmail,
        customerFirstName: createOrderDto.customerFirstName,
        customerLastName: createOrderDto.customerLastName,
        orderItems: {
          create: createOrderDto.items.map((item) => ({
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

    return new Order(orderData as OrderWithRelations);
  }

  async findAll(): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => new Order(order as OrderWithRelations));
  }

  async findByUserId(userId: number): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            manga: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => new Order(order as OrderWithRelations));
  }

  async findOne(id: number): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
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

    return order ? new Order(order as OrderWithRelations) : null;
  }

  async updateStatus(
    id: number,
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
  ): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
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

    return new Order(order as OrderWithRelations);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.order.delete({
      where: { id },
    });
  }

  async getOrdersStats() {
    const [
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue,
      guestOrders,
      registeredUserOrders,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'SHIPPED' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({ where: { userId: null } }), // Гостевые заказы
      this.prisma.order.count({ where: { userId: { not: null } } }), // Заказы пользователей
    ]);

    return {
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue: totalRevenue._sum.totalAmount || new Decimal(0),
      guestOrders,
      registeredUserOrders,
      guestOrdersPercentage: totalOrders > 0 ? (guestOrders / totalOrders * 100).toFixed(1) : 0,
    };
  }
}