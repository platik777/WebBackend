import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { readFileSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs';
import { NextFunction, Request } from 'express';
import { IResponseWithLayout } from './common/interfaces/IResponseWithLayout';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('hbs');

  hbs.registerPartials(join(process.cwd(), 'views', 'partials'));

  const mangaCardPartial = readFileSync(
    join(process.cwd(), 'views', 'partials', 'manga-card.hbs'),
    'utf8',
  );
  hbs.registerPartial('manga-card', mangaCardPartial);

  const userInfoPartial = readFileSync(
    join(process.cwd(), 'views', 'partials', 'user-info.hbs'),
    'utf8',
  );
  hbs.registerPartial('user-info', userInfoPartial);

  hbs.registerHelper('eq', (a: any, b: any) => a === b);

  hbs.registerHelper('range', function (n: number) {
    const result: number[] = [];
    for (let i = 0; i < n; i++) {
      result.push(i);
    }
    return result;
  });

  hbs.registerHelper('subtract', function (a: number, b: number) {
    return a - b;
  });

  hbs.registerHelper('json', function (context: any) {
    return JSON.stringify(context);
  });

  hbs.registerHelper('formatDate', function (date: Date | string) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  hbs.registerHelper('formatPrice', function (price: number) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  });

  hbs.registerHelper('statusText', function (status: string) {
    const statusTexts: Record<string, string> = {
      PENDING: 'Ожидает обработки',
      PROCESSING: 'В обработке',
      SHIPPED: 'Отправлен',
      DELIVERED: 'Доставлен',
      CANCELLED: 'Отменен',
    };
    return statusTexts[status] || status;
  });

  hbs.registerHelper('if_eq', function (a: any, b: any, options: any) {
    if (a === b) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  hbs.registerHelper('unless_eq', function (a: any, b: any, options: any) {
    if (a !== b) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  hbs.registerHelper('times', function (n: number, options: any) {
    let result = '';
    for (let i = 0; i < n; i++) {
      result += options.fn(i);
    }
    return result;
  });

  hbs.registerHelper('stars', function (rating: number) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<span class="star filled">★</span>';
      } else {
        stars += '<span class="star">★</span>';
      }
    }
    return new (hbs as any).SafeString(stars);
  });

  hbs.registerHelper('truncate', function (str: string, length: number) {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
  });

  hbs.registerHelper(
    'pluralize',
    function (count: number, singular: string, plural: string) {
      return count === 1 ? singular : plural;
    },
  );

  hbs.registerHelper(
    'ifCond',
    function (v1: any, operator: string, v2: any, options: any) {
      switch (operator) {
        case '==':
          return v1 == v2 ? options.fn(this) : options.inverse(this);
        case '===':
          return v1 === v2 ? options.fn(this) : options.inverse(this);
        case '!=':
          return v1 != v2 ? options.fn(this) : options.inverse(this);
        case '!==':
          return v1 !== v2 ? options.fn(this) : options.inverse(this);
        case '<':
          return v1 < v2 ? options.fn(this) : options.inverse(this);
        case '<=':
          return v1 <= v2 ? options.fn(this) : options.inverse(this);
        case '>':
          return v1 > v2 ? options.fn(this) : options.inverse(this);
        case '>=':
          return v1 >= v2 ? options.fn(this) : options.inverse(this);
        case '&&':
          return v1 && v2 ? options.fn(this) : options.inverse(this);
        case '||':
          return v1 || v2 ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    },
  );

  app.use((req: Request, res: IResponseWithLayout, next: NextFunction) => {
    res.locals.layout = 'layouts/layout';
    next();
  });

  app.set('view options', {
    extension: 'hbs',
    map: { html: 'hbs' },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, () => {
    console.log('App start at port: ', port);
  });
}

bootstrap();
