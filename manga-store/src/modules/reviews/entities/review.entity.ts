import { Review as PrismaReview } from '@prisma/client';

export type ReviewWithRelations = PrismaReview & {
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  manga?: {
    id: number;
    title: string;
    imageUrl: string | null;
  };
};

export class Review implements PrismaReview {
  id: number;
  rating: number;
  comment: string | null;
  userId: number;
  mangaId: number;
  createdAt: Date;
  updatedAt: Date;

  user?: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  manga?: {
    id: number;
    title: string;
    imageUrl: string | null;
  } | null;

  constructor(partial: Partial<ReviewWithRelations>) {
    Object.assign(this, partial);
  }

  get ratingText(): string {
    const ratingTexts = {
      1: 'Ужасно',
      2: 'Плохо',
      3: 'Удовлетворительно',
      4: 'Хорошо',
      5: 'Отлично',
    };

    return ratingTexts[this.rating as keyof typeof ratingTexts] || 'Неизвестно';
  }

  get hasComment(): boolean {
    return this.comment !== null && this.comment.trim().length > 0;
  }

  get commentLength(): number {
    return this.comment?.length || 0;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.rating < 1 || this.rating > 5) {
      errors.push('Рейтинг должен быть от 1 до 5');
    }

    if (this.comment && this.comment.length > 1000) {
      errors.push('Комментарий не может превышать 1000 символов');
    }

    if (
      this.comment &&
      this.comment.trim().length < 5 &&
      this.comment.trim().length > 0
    ) {
      errors.push('Комментарий должен содержать минимум 5 символов');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getFormattedDate(): string {
    return this.createdAt.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}