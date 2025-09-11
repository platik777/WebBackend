import { Review as PrismaReview, User, Manga } from '@prisma/client';

// Тип для Review с включенными связями
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

  // Дополнительные поля для связей (будут заполнены через Prisma include)
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

  get isPositive(): boolean {
    return this.rating >= 4;
  }

  get isNegative(): boolean {
    return this.rating <= 2;
  }

  get isNeutral(): boolean {
    return this.rating === 3;
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

  get isDetailed(): boolean {
    return this.hasComment && this.commentLength >= 50;
  }

  // Получить имя автора отзыва
  get authorName(): string {
    if (!this.user) return 'Аноним';
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  // Получить название манги
  get mangaTitle(): string {
    return this.manga?.title || 'Неизвестная манга';
  }

  updateRating(newRating: number): void {
    if (newRating < 1 || newRating > 5) {
      throw new Error('Рейтинг должен быть от 1 до 5');
    }
    this.rating = newRating;
  }

  updateComment(newComment: string | null): void {
    if (newComment !== null) {
      const trimmedComment = newComment.trim();

      if (trimmedComment.length === 0) {
        this.comment = null;
        return;
      }

      if (trimmedComment.length > 1000) {
        throw new Error('Комментарий не может превышать 1000 символов');
      }

      if (trimmedComment.length < 5) {
        throw new Error('Комментарий должен содержать минимум 5 символов');
      }

      this.comment = trimmedComment;
    } else {
      this.comment = null;
    }
  }

  containsInappropriateContent(): boolean {
    if (!this.comment) return false;

    const inappropriateWords = [
      'спам',
      'реклама',
      'купить',
      'дешево',
      'скидка',
    ];

    const lowerComment = this.comment.toLowerCase();
    return inappropriateWords.some((word) => lowerComment.includes(word));
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

    if (this.containsInappropriateContent()) {
      errors.push('Комментарий содержит неподобающий контент');
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

  // Получить относительную дату (например, "2 дня назад")
  getRelativeDate(): string {
    const now = new Date();
    const diffInMs = now.getTime() - this.createdAt.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Сегодня';
    } else if (diffInDays === 1) {
      return 'Вчера';
    } else if (diffInDays < 7) {
      return `${diffInDays} дней назад`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'неделю' : 'недель'} назад`;
    } else {
      return this.getFormattedDate();
    }
  }

  // Генерация звезд для отображения
  getStarsHtml(): string {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= this.rating) {
        stars += '<span class="star filled">★</span>';
      } else {
        stars += '<span class="star">★</span>';
      }
    }
    return stars;
  }
}