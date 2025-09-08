import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Order } from './entities/order.entity';
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

    const orderData = await this.prisma.order.create({
      data: {
        status: 'PENDING',
        totalAmount,
        userId: createOrderDto.userId,
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

    return new Order(orderData);
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

    return orders.map((order) => new Order(order));
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

    return orders.map((order) => new Order(order));
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

    return order ? new Order(order) : null;
  }

  async updateStatus(
    id: number,
    status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
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

    return new Order(order);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.order.delete({
      where: { id },
    });
  }

  // Статистические методы
  async getOrdersStats() {
    const [
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'SHIPPED' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue: totalRevenue._sum.totalAmount || new Decimal(0),
    };
  }
}
