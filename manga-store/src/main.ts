import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { readFileSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs';
import { NextFunction, Request } from 'express';
import { IResponseWithLayout } from './common/interfaces/IResponseWithLayout';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('hbs');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
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

  const config = new DocumentBuilder()
    .setTitle('Manga Store API')
    .setDescription('RESTful API для интернет-магазина манги')
    .setVersion('1.0')
    .addTag('manga', 'Операции с мангой')
    .addTag('users', 'Операции с пользователями')
    .addTag('orders', 'Операции с заказами')
    .addTag('reviews', 'Операции с отзывами')
    .addTag('authors', 'Операции с авторами')
    .addServer('http://localhost:3000', 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      sortByTags: true,
    },
    customSiteTitle: 'Manga Store API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .scheme-container { background: #fafafa; padding: 15px; border-radius: 4px; }
    `,
  });

  const port = process.env.PORT || configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
