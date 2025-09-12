// src/modules/cart/cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(addToCartDto);
  }

  @Get(':sessionId')
  async getCart(@Param('sessionId') sessionId: string) {
    return this.cartService.getCartBySession(sessionId);
  }

  @Patch('item/:itemId')
  async updateCartItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    try {
      return await this.cartService.updateItem(itemId, updateCartItemDto);
    } catch (error) {
      throw new NotFoundException('Товар в корзине не найден');
    }
  }

  @Delete('item/:itemId')
  async removeFromCart(@Param('itemId', ParseIntPipe) itemId: number) {
    try {
      await this.cartService.removeItem(itemId);
      return { message: 'Товар удален из корзины' };
    } catch (error) {
      throw new NotFoundException('Товар в корзине не найден');
    }
  }

  @Delete(':sessionId/clear')
  async clearCart(@Param('sessionId') sessionId: string) {
    await this.cartService.clearCart(sessionId);
    return { message: 'Корзина очищена' };
  }

  @Get(':sessionId/summary')
  async getCartSummary(@Param('sessionId') sessionId: string) {
    return this.cartService.getCartSummary(sessionId);
  }

  @Post(':sessionId/checkout')
  async checkout(
    @Param('sessionId') sessionId: string,
    @Body() checkoutData: any,
  ) {
    return this.cartService.checkout(sessionId, checkoutData);
  }
}