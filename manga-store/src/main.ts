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
  const user_info = readFileSync(
    join(process.cwd(), 'views', 'partials', 'user-info.hbs'),
    'utf8',
  );
  hbs.registerPartial('user-info', user_info);
  hbs.registerHelper('eq', (a, b) => a === b);

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
