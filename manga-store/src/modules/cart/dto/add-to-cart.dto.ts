import { IsNumber, IsString, Min, IsOptional } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  mangaId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsNumber()
  userId?: number;
}