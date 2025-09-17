import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Email пользователя', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Пароль (минимум 6 символов)', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Имя пользователя', example: 'Иван' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ description: 'Фамилия пользователя', example: 'Иванов' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ description: 'Номер телефона', example: '+79991234567', required: false })
  @IsOptional()
  @IsPhoneNumber('RU')
  phone?: string;

  @ApiProperty({ description: 'Адрес', example: 'ул. Пушкина, д. 10, кв. 5', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Город', example: 'Москва', required: false })
  @IsOptional()
  @IsString()
  city?: string;
}