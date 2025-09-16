import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsWebController } from './reviews-web.controller';

@Module({
  controllers: [ReviewsController, ReviewsWebController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
