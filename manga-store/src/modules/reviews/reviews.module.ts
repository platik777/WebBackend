import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsWebController } from './reviews-web.controller';
import { ReviewsApiController } from './reviews-api.controller';

@Module({
  controllers: [ReviewsController, ReviewsWebController, ReviewsApiController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}