import { ApiProperty } from '@nestjs/swagger';

export class AuthorResponseDto {
  @ApiProperty({ description: 'ID автора', example: 1 })
  id: number;

  @ApiProperty({ description: 'Имя автора', example: 'Хадзимэ' })
  firstName: string;

  @ApiProperty({ description: 'Фамилия автора', example: 'Исаяма' })
  lastName: string;

  @ApiProperty({ description: 'Псевдоним', example: null, required: false })
  pseudonym?: string;

  @ApiProperty({ description: 'Биография', example: 'Японский мангака, известный своей работой "Атака титанов"', required: false })
  biography?: string;

  @ApiProperty({ description: 'Дата рождения', example: '1986-08-29T00:00:00.000Z', required: false })
  birthDate?: string;

  @ApiProperty({ description: 'Национальность', example: 'Японец', required: false })
  nationality?: string;

  @ApiProperty({ description: 'Активен ли автор', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Отображаемое имя', example: 'Хадзимэ Исаяма' })
  displayName: string;

  @ApiProperty({ description: 'Количество произведений', example: 5 })
  worksCount?: number;

  constructor(author: any) {
    this.id = author.id;
    this.firstName = author.firstName;
    this.lastName = author.lastName;
    this.pseudonym = author.pseudonym;
    this.biography = author.biography;
    this.birthDate = author.birthDate?.toISOString();
    this.nationality = author.nationality;
    this.isActive = author.isActive;
    this.displayName = author.pseudonym || `${author.firstName} ${author.lastName}`;
    this.worksCount = author.worksCount;
  }
}