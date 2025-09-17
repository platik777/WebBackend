import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderStatus } from './dto/update-order-status.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const orderCreateData: any = {
      totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
      shippingCity: createOrderDto.shippingCity,
      shippingPhone: createOrderDto.shippingPhone,
      orderItems: {
        create: createOrderDto.items.map((item) => ({
          mangaId: item.mangaId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    };

    if (createOrderDto.userId !== undefined) {
      orderCreateData.userId = createOrderDto.userId;
    }

    if (createOrderDto.paymentMethod !== undefined) {
      orderCreateData.paymentMethod = createOrderDto.paymentMethod;
    }

    if (createOrderDto.customerEmail !== undefined) {
      orderCreateData.customerEmail = createOrderDto.customerEmail;
    }

    if (createOrderDto.customerFirstName !== undefined) {
      orderCreateData.customerFirstName = createOrderDto.customerFirstName;
    }

    if (createOrderDto.customerLastName !== undefined) {
      orderCreateData.customerLastName = createOrderDto.customerLastName;
    }

    const orderData = await this.prisma.order.create({
      data: orderCreateData,
      include: {
        orderItems: {
          include: {
            manga: true,
          },
        },
        user: true,
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
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => new Order(order));
  }

  async findAllPaginated(
    paginationQuery: PaginationQueryDto,
    filters?: {
      status?: string;
    },
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const options = PaginationUtil.buildPaginationOptions(paginationQuery);
    const { skip, take } = PaginationUtil.buildSkipTake(options);

    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: {
            include: {
              manga: true,
            },
          },
          user: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const orderResponses = orders.map((order) => new OrderResponseDto(new Order(order)));

    return PaginationUtil.buildPaginatedResponse(
      orderResponses,
      options,
      total,
      '/api/orders',
      { status: filters?.status },
    );
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            manga: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }

    return new Order(order);
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
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => new Order(order));
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    await this.findOne(id);

    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            manga: true,
          },
        },
        user: true,
      },
    });

    return new Order(order);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.order.delete({
      where: { id },
    });
  }

  async getOrdersStats() {
    const [totalOrders, totalRevenue, ordersByStatus] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
    ]);

    const avgOrderValue = totalOrders > 0 ? (totalRevenue._sum.totalAmount?.toNumber() || 0) / totalOrders : 0;

    const statusCounts = ordersByStatus.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount?.toNumber() || 0,
      avgOrderValue: Number(avgOrderValue.toFixed(2)),
      ordersByStatus: statusCounts,
    };
  }
}
