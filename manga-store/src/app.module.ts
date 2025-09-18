import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { MangaModule } from './modules/manga/manga.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { S3Module } from './modules/s3/s3.module';

import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { ETagInterceptor } from './common/interceptors/etag.interceptor';
import { CacheControlInterceptor } from './common/interceptors/cache-control.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    CacheModule.register({
      isGlobal: true,
      ttl: 5000, // TTL 5 секунд для демонстрации
      max: 100,  // Максимум 100 элементов в кэше
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
      formatError: (error) => ({
        message: error.message,
        code: error.extensions?.code,
        locations: error.locations,
        path: error.path,
      }),
    }),

    DatabaseModule,
    UsersModule,
    MangaModule,
    OrdersModule,
    AuthorsModule,
    ReviewsModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TimingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ETagInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheControlInterceptor,
    },
  ],
})
export class AppModule {}