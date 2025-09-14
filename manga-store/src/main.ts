import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { readFileSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as hbs from 'hbs';
import { NextFunction, Request } from 'express';
import { IResponseWithLayout } from './common/interfaces/IResponseWithLayout';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Настройка статических файлов и представлений
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('hbs');

  // Настройка валидации
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Manga Store API')
    .setDescription('API документация для интернет-магазина манги')
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
    customSiteTitle: 'Manga Store API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });

  // Настройка Handlebars
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

  app.use('/layout', (req: Request, res: IResponseWithLayout, next: NextFunction) => {
    res.locals.layout = 'main';
    next();
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`Приложение запущено на порту ${port}`);
  console.log(`Swagger документация: http://localhost:${port}/api/docs`);
}
bootstrap();