import { IsString, IsNumber, IsArray, IsOptional, ArrayMinSize, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: 'ID манги', example: 1 })
  @IsNumber()
  mangaId: number;

  @ApiProperty({ description: 'Количество', example: 2 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Цена за единицу', example: 890.50 })
  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'ID пользователя', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ description: 'Товары в заказе', type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'Адрес доставки', example: 'ул. Ленина, д. 15, кв. 23' })
  @IsString()
  shippingAddress: string;

  @ApiProperty({ description: 'Город доставки', example: 'Москва' })
  @IsString()
  shippingCity: string;

  @ApiProperty({ description: 'Телефон для связи', example: '+79991234567' })
  @IsString()
  shippingPhone: string;

  @ApiProperty({ description: 'Способ оплаты', example: 'card', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ description: 'Email покупателя', example: 'customer@example.com', required: false })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ description: 'Имя покупателя', example: 'Иван', required: false })
  @IsOptional()
  @IsString()
  customerFirstName?: string;

  @ApiProperty({ description: 'Фамилия покупателя', example: 'Иванов', required: false })
  @IsOptional()
  @IsString()
  customerLastName?: string;
}