// src/modules/orders/entities/order.entity.ts
import {
  Order as PrismaOrder,
  OrderStatus,
  PaymentStatus,
  OrderItem,
  User,
  Manga,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Тип для Order с включенными связями
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

  // Новые поля для гостевых заказов
  customerEmail: string | null;
  customerFirstName: string | null;
  customerLastName: string | null;

  createdAt: Date;
  updatedAt: Date;
  shippedAt: Date | null;

  // Дополнительные поля для связей (будут заполнены через Prisma include)
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

  get canBeCancelled(): boolean {
    return (
      this.status === OrderStatus.PENDING ||
      this.status === OrderStatus.PROCESSING
    );
  }

  get canBeShipped(): boolean {
    return (
      this.status === OrderStatus.PROCESSING &&
      this.paymentStatus === PaymentStatus.PAID
    );
  }

  get canBeDelivered(): boolean {
    return this.status === OrderStatus.SHIPPED;
  }

  get isCompleted(): boolean {
    return this.status === OrderStatus.DELIVERED;
  }

  get isPaid(): boolean {
    return this.paymentStatus === PaymentStatus.PAID;
  }

  // Получить общее количество товаров в заказе
  get totalItems(): number {
    if (!this.orderItems) return 0;
    return this.orderItems.reduce((total, item) => total + item.quantity, 0);
  }

  // Получить список товаров с деталями
  get itemsSummary(): string {
    if (!this.orderItems || this.orderItems.length === 0) {
      return 'Нет товаров';
    }

    return this.orderItems
      .map((item) => `${item.manga.title} x${item.quantity}`)
      .join(', ');
  }

  // Получить имя клиента (для гостевых заказов или пользователей)
  get customerName(): string {
    if (this.user) {
      return `${this.user.firstName} ${this.user.lastName}`;
    }
    if (this.customerFirstName && this.customerLastName) {
      return `${this.customerFirstName} ${this.customerLastName}`;
    }
    return 'Клиент';
  }

  // Получить email клиента
  get customerEmailAddress(): string {
    return this.user?.email || this.customerEmail || '';
  }

  // Методы для изменения статуса заказа
  markAsProcessing(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error(
        `Нельзя перевести заказ в обработку из статуса: ${this.status}`,
      );
    }
    this.status = OrderStatus.PROCESSING;
  }

  markAsShipped(): void {
    if (!this.canBeShipped) {
      throw new Error(
        'Заказ не может быть отправлен. Проверьте статус заказа и оплаты.',
      );
    }
    this.status = OrderStatus.SHIPPED;
    this.shippedAt = new Date();
  }

  markAsDelivered(): void {
    if (!this.canBeDelivered) {
      throw new Error('Заказ не может быть помечен как доставленный');
    }
    this.status = OrderStatus.DELIVERED;
  }

  cancel(): void {
    if (!this.canBeCancelled) {
      throw new Error(`Заказ нельзя отменить в статусе: ${this.status}`);
    }
    this.status = OrderStatus.CANCELLED;
  }

  // Методы для управления оплатой
  markAsPaid(paymentMethod: string): void {
    if (this.paymentStatus === PaymentStatus.PAID) {
      throw new Error('Заказ уже оплачен');
    }
    this.paymentStatus = PaymentStatus.PAID;
    this.paymentMethod = paymentMethod;
  }

  markPaymentAsFailed(): void {
    this.paymentStatus = PaymentStatus.FAILED;
  }

  refund(): void {
    if (this.paymentStatus !== PaymentStatus.PAID) {
      throw new Error('Возврат возможен только для оплаченных заказов');
    }
    this.paymentStatus = PaymentStatus.REFUNDED;
  }

  // Генерация уникального номера заказа
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORDER-${timestamp}-${random}`;
  }

  // Расчет времени доставки (примерная логика)
  getEstimatedDeliveryDays(): number {
    const cityDeliveryDays: { [key: string]: number } = {
      Москва: 1,
      СПб: 2,
      'Санкт-Петербург': 2,
      Казань: 3,
      Новосибирск: 5,
    };

    return cityDeliveryDays[this.shippingCity] || 7; // По умолчанию 7 дней
  }

  // Получить отформатированную дату создания
  getFormattedCreatedDate(): string {
    return this.createdAt.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Получить статус на русском языке
  getStatusText(): string {
    const statusTexts: Record<OrderStatus, string> = {
      PENDING: 'Ожидает обработки',
      PROCESSING: 'В обработке',
      SHIPPED: 'Отправлен',
      DELIVERED: 'Доставлен',
      CANCELLED: 'Отменен',
    };
    return statusTexts[this.status];
  }
}