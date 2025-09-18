import { SetMetadata } from '@nestjs/common';

export const CACHE_CONTROL_KEY = 'cache-control';

/**
 * Декоратор для установки заголовков Cache-Control
 * @param options - опции кэширования
 */
export const CacheControl = (options: {
  maxAge?: number; // в секундах
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  public?: boolean;
  private?: boolean;
}) => {
  const cacheControlParts: string[] = [];

  if (options.maxAge !== undefined) {
    cacheControlParts.push(`max-age=${options.maxAge}`);
  }

  if (options.noCache) {
    cacheControlParts.push('no-cache');
  }

  if (options.noStore) {
    cacheControlParts.push('no-store');
  }

  if (options.mustRevalidate) {
    cacheControlParts.push('must-revalidate');
  }

  if (options.public) {
    cacheControlParts.push('public');
  }

  if (options.private) {
    cacheControlParts.push('private');
  }

  const cacheControlValue = cacheControlParts.join(', ');

  return SetMetadata(CACHE_CONTROL_KEY, cacheControlValue);
};

/**
 * Готовые декораторы для частых случаев
 */

// Кэш на 1 час
export const CacheOneHour = () => CacheControl({ maxAge: 3600, public: true });

// Кэш на 1 день
export const CacheOneDay = () => CacheControl({ maxAge: 86400, public: true });

// Кэш на 1 неделю
export const CacheOneWeek = () => CacheControl({ maxAge: 604800, public: true });

// Не кэшировать
export const NoCache = () => CacheControl({ noCache: true, noStore: true });