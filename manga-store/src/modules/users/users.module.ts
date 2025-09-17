import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersApiController } from './users-api.controller';

@Module({
  controllers: [UsersController, UsersApiController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}