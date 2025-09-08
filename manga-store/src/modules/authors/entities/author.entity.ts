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

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number | null {
    if (!this.birthDate) return null;

    const today = new Date();
    const birthYear = this.birthDate.getFullYear();
    const currentYear = today.getFullYear();

    let age = currentYear - birthYear;

    const monthDiff = today.getMonth() - this.birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < this.birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  get isLiving(): boolean {
    if (!this.birthDate) return true;
    return this.age !== null && this.age <= 120;
  }

  hasWrittenIn(language: string): boolean {
    // Упрощенная логика на основе национальности
    const languageMap: { [key: string]: string[] } = {
      Japanese: ['Японский', 'Japanese'],
      Korean: ['Корейский', 'Korean'],
      Chinese: ['Китайский', 'Chinese'],
      American: ['Английский', 'English'],
      Russian: ['Русский', 'Russian'],
    };

    const authorLanguages = languageMap[this.nationality || ''] || [];
    return authorLanguages.includes(language);
  }

  updateBiography(newBiography: string): void {
    if (newBiography.trim().length < 10) {
      throw new Error('Биография должна содержать минимум 10 символов');
    }
    this.biography = newBiography.trim();
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
