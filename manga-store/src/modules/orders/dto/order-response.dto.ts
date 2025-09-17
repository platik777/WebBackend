import { ApiProperty } from '@nestjs/swagger';

class OrderItemResponseDto {
  @ApiProperty({ description: 'ID товара в заказе', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID манги', example: 1 })
  mangaId: number;

  @ApiProperty({ description: 'Название манги', example: 'Атака титанов' })
  mangaTitle: string;

  @ApiProperty({ description: 'Количество', example: 2 })
  quantity: number;

  @ApiProperty({ description: 'Цена за единицу', example: 890.50 })
  price: number;

  @ApiProperty({ description: 'Общая стоимость', example: 1781.00 })
  totalPrice: number;
}

export class OrderResponseDto {
  @ApiProperty({ description: 'ID заказа', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID пользователя', example: 1, required: false })
  userId?: number;

  @ApiProperty({ description: 'Имя пользователя', example: 'Иван Иванов', required: false })
  customerName?: string;

  @ApiProperty({ description: 'Email покупателя', example: 'customer@example.com', required: false })
  customerEmail?: string;

  @ApiProperty({ description: 'Статус заказа', example: 'PENDING', enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ description: 'Общая стоимость заказа', example: 2671.50 })
  totalAmount: number;

  @ApiProperty({ description: 'Адрес доставки', example: 'ул. Ленина, д. 15, кв. 23' })
  shippingAddress: string;

  @ApiProperty({ description: 'Город доставки', example: 'Москва' })
  shippingCity: string;

  @ApiProperty({ description: 'Телефон для связи', example: '+7 (999) 123-45-67' })
  shippingPhone: string;

  @ApiProperty({ description: 'Способ оплаты', example: 'card', required: false })
  paymentMethod?: string;

  @ApiProperty({ description: 'Товары в заказе', type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ description: 'Дата создания заказа', example: '2024-01-15T10:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'Дата обновления заказа', example: '2024-01-20T15:45:00.000Z' })
  updatedAt: string;

  constructor(order: any) {
    this.id = order.id;
    this.userId = order.userId;
    this.customerName = order.customerName;
    this.customerEmail = order.customerEmail;
    this.status = order.status;
    this.totalAmount = order.totalAmount;
    this.shippingAddress = order.shippingAddress;
    this.shippingCity = order.shippingCity;
    this.shippingPhone = order.shippingPhone;
    this.paymentMethod = order.paymentMethod;
    this.items = order.items || [];
    this.createdAt = order.createdAt.toISOString();
    this.updatedAt = order.updatedAt.toISOString();
  }
}