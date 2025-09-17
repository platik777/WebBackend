import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MinLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ description: 'Имя автора', example: 'Хадзимэ' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ description: 'Фамилия автора', example: 'Исаяма' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ description: 'Псевдоним', example: null, required: false })
  @IsOptional()
  @IsString()
  pseudonym?: string;

  @ApiProperty({ description: 'Биография', required: false })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiProperty({ description: 'Дата рождения', example: '1986-08-29', required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ description: 'Национальность', example: 'Японец', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;
}