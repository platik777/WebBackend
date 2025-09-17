import { Author as PrismaAuthor } from '@prisma/client';

export class Author implements PrismaAuthor {
  id: number;
  firstName: string;
  lastName: string;
  pseudonym: string | null;
  biography: string | null;
  birthDate: Date | null;
  nationality: string | null;
  isActive: boolean;

  constructor(partial: Partial<Author>) {
    Object.assign(this, partial);
  }

  get displayName(): string {
    return this.pseudonym || `${this.firstName} ${this.lastName}`;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.firstName?.trim()) {
      errors.push('Имя автора обязательно');
    }

    if (!this.lastName?.trim()) {
      errors.push('Фамилия автора обязательна');
    }

    if (this.birthDate && this.birthDate > new Date()) {
      errors.push('Дата рождения не может быть в будущем');
    }

    if (this.biography && this.biography.length > 2000) {
      errors.push('Биография не может превышать 2000 символов');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
