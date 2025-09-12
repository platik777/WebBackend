import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CheckoutDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  shippingPhone: string;

  @IsString()
  shippingAddress: string;

  @IsString()
  shippingCity: string;

  @IsOptional()
  @IsString()
  notes?: string;
}