import { SetMetadata } from '@nestjs/common';

export const CACHE_CONTROL_KEY = 'cache-control';

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

export const CacheOneHour = () => CacheControl({ maxAge: 3600, public: true });

export const CacheOneDay = () => CacheControl({ maxAge: 86400, public: true });

export const CacheOneWeek = () => CacheControl({ maxAge: 604800, public: true });

export const NoCache = () => CacheControl({ noCache: true, noStore: true });