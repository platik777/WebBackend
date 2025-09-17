import {
  Order as PrismaOrder,
  OrderStatus,
  PaymentStatus,
  OrderItem,
  User,
  Manga,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export type OrderWithRelations = PrismaOrder & {
  orderItems?: (OrderItem & {
    manga: Manga;
  })[];
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

export class Order implements PrismaOrder {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: Decimal;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;
  userId: number | null;

  customerEmail: string | null;
  customerFirstName: string | null;
  customerLastName: string | null;

  createdAt: Date;
  updatedAt: Date;
  shippedAt: Date | null;

  orderItems?: (OrderItem & {
    manga: Manga;
  })[];
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;

  constructor(partial: Partial<OrderWithRelations>) {
    Object.assign(this, partial);
  }

  get customerName(): string {
    if (this.user) {
      return `${this.user.firstName} ${this.user.lastName}`;
    }
    if (this.customerFirstName && this.customerLastName) {
      return `${this.customerFirstName} ${this.customerLastName}`;
    }
    return 'Клиент';
  }
}