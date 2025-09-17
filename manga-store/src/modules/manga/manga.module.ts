import { Module, forwardRef } from '@nestjs/common';
import { MangaService } from './manga.service';
import { MangaController } from './manga.controller';
import { MangaApiController } from './manga-api.controller';
import { MangaResolver } from './graphql/manga.resolver';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [
    forwardRef(() => ReviewsModule),
  ],
  controllers: [MangaController, MangaApiController],
  providers: [MangaService, MangaResolver],
  exports: [MangaService],
})
export class MangaModule {}