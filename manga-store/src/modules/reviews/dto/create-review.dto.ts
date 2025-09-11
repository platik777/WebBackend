import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsInt()
  userId: number;

  @IsInt()
  mangaId: number;
}
