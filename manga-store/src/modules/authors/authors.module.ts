import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { AuthorsApiController } from './authors-api.controller';

@Module({
  controllers: [AuthorsController, AuthorsApiController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}