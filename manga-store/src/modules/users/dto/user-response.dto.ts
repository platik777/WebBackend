import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Email пользователя', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Имя пользователя', example: 'Иван' })
  firstName: string;

  @ApiProperty({ description: 'Фамилия пользователя', example: 'Иванов' })
  lastName: string;

  @ApiProperty({ description: 'Номер телефона', example: '+7 (999) 123-45-67', required: false })
  phone?: string;

  @ApiProperty({ description: 'Адрес', example: 'ул. Пушкина, д. 10, кв. 5', required: false })
  address?: string;

  @ApiProperty({ description: 'Город', example: 'Москва', required: false })
  city?: string;

  @ApiProperty({ description: 'Активен ли пользователь', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Является ли администратором', example: false })
  isAdmin: boolean;

  @ApiProperty({ description: 'Дата регистрации', example: '2024-01-15T10:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'Дата последнего обновления', example: '2024-01-20T15:45:00.000Z' })
  updatedAt: string;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.phone = user.phone;
    this.address = user.address;
    this.city = user.city;
    this.isActive = user.isActive;
    this.isAdmin = user.isAdmin;
    this.createdAt = user.createdAt.toISOString();
    this.updatedAt = user.updatedAt.toISOString();
  }
}