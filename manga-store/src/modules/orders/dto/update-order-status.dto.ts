import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Новый статус заказа',
    enum: OrderStatus,
    example: OrderStatus.PROCESSING
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}