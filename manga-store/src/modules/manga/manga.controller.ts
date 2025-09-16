import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { MangaService } from './manga.service';
import { CreateMangaDto } from './dto/create-manga.dto';
import { UpdateMangaDto } from './dto/update-manga.dto';

@Controller('manga')
export class MangaController {
  constructor(private readonly mangaService: MangaService) {}

  @Post()
  async create(@Body() createMangaDto: CreateMangaDto) {
    return this.mangaService.create(createMangaDto);
  }

  @Get()
  async findAll(@Query() filters: any) {
    return this.mangaService.findAll(filters);
  }

  @Get('featured')
  async findFeatured() {
    return this.mangaService.findFeatured();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const manga = await this.mangaService.findOne(id);
    if (!manga) {
      throw new NotFoundException('Манга не найдена');
    }
    return manga;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMangaDto: UpdateMangaDto,
  ) {
    try {
      return await this.mangaService.update(id, updateMangaDto);
    } catch (error) {
      throw new NotFoundException('Манга не найдена');
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.mangaService.remove(id);
      return { message: 'Манга успешно удалена' };
    } catch (error) {
      throw new NotFoundException('Манга не найдена');
    }
  }

  @Patch(':id/stock')
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    try {
      await this.mangaService.updateStock(id, quantity);
      return { message: 'Склад обновлен' };
    } catch (error) {
      throw new NotFoundException('Манга не найдена');
    }
  }
}
