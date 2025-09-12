import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MangaModule } from '../manga/manga.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [MangaModule, OrdersModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}