import {
  Order as PrismaOrder,
  OrderStatus,
  PaymentStatus,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

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
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  shippedAt: Date | null;

  constructor(partial: Partial<Order>) {
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
}
