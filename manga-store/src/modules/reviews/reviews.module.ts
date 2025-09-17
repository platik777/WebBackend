import { Module, forwardRef } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsWebController } from './reviews-web.controller';
import { ReviewsApiController } from './reviews-api.controller';
import { ReviewResolver } from './graphql/review.resolver';
import { MangaModule } from '../manga/manga.module';

@Module({
  imports: [
    forwardRef(() => MangaModule),
  ],
  controllers: [ReviewsController, ReviewsWebController, ReviewsApiController],
  providers: [ReviewsService, ReviewResolver],
  exports: [ReviewsService],
})
export class ReviewsModule {}