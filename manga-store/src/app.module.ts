import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { MangaModule } from './modules/manga/manga.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // GraphQL Configuration
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      // Настройки безопасности и сложности запросов
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}