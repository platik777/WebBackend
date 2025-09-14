import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { MangaModule } from './modules/manga/manga.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    MangaModule,
    OrdersModule,
    AuthorsModule,
    ReviewsModule,
    RouterModule.register([
      {
        path: 'api',
        children: [
          { path: 'users', module: UsersModule },
          { path: 'manga', module: MangaModule },
          { path: 'orders', module: OrdersModule },
          { path: 'authors', module: AuthorsModule },
          { path: 'reviews', module: ReviewsModule },
        ],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}