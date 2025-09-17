import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('orders')
@Controller('api/orders')
export class OrdersApiController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый заказ' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Заказ успешно создан',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные',
  })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = await this.ordersService.create(createOrderDto);
    return new OrderResponseDto(order);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список заказов с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Фильтр по статусу' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список заказов с пагинацией',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('status') status?: string,
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const filters = { status };
    return await this.ordersService.findAllPaginated(paginationQuery, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику заказов' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Статистика заказов',
    schema: {
      type: 'object',
      properties: {
        totalOrders: { type: 'number', example: 100 },
        totalRevenue: { type: 'number', example: 50000 },
        avgOrderValue: { type: 'number', example: 500 },
        ordersByStatus: {
          type: 'object',
          example: { pending: 10, processing: 20, shipped: 30, delivered: 35, cancelled: 5 },
        },
      },
    },
  })
  async getStats() {
    return await this.ordersService.getOrdersStats();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Получить заказы пользователя' })
  @ApiParam({ name: 'userId', type: Number, description: 'ID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Заказы пользователя',
    type: [OrderResponseDto],
  })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<OrderResponseDto[]> {
    const orders = await this.ordersService.findByUserId(userId);
    return orders.map(order => new OrderResponseDto(order));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заказ по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID заказа' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Заказ найден',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Заказ не найден',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderResponseDto> {
    const order = await this.ordersService.findOne(id);
    return new OrderResponseDto(order);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Обновить статус заказа' })
  @ApiParam({ name: 'id', type: Number, description: 'ID заказа' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Статус заказа успешно обновлен',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Заказ не найден',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректный статус',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.updateStatus(id, updateStatusDto.status);
    return new OrderResponseDto(order);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить заказ' })
  @ApiParam({ name: 'id', type: Number, description: 'ID заказа' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Заказ успешно удален',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Заказ успешно удален' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Заказ не найден',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.ordersService.remove(id);
    return { message: 'Заказ успешно удален' };
  }
}