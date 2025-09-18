import {
  Controller,
  Post,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { S3Service } from '../s3/s3.service';
import { MangaService } from './manga.service';
import { CacheOneHour } from '../../common/decorators/cache-control.decorator';

@ApiTags('manga-upload')
@Controller('api/manga')
export class MangaUploadController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly mangaService: MangaService,
  ) {}

  @Post('upload-cover')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Загрузить обложку для новой манги' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Файл обложки манги',
    schema: {
      type: 'object',
      properties: {
        cover: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения (JPEG, PNG, WEBP, максимум 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Обложка успешно загружена',
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          description: 'URL загруженной обложки',
        },
        message: {
          type: 'string',
          example: 'Обложка успешно загружена',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный файл или параметры',
  })
  @CacheOneHour()
  async uploadCover(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл обложки обязателен');
    }

    try {
      // Валидация файла
      S3Service.validateImageFile(file);

      // Загрузка в S3 в папку covers
      const imageUrl = await this.s3Service.uploadFile(file, 'covers');
      

      return {
        imageUrl,
        message: 'Обложка успешно загружена',
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ошибка загрузки файла',
      );
    }
  }

  @Patch(':id/cover')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Обновить обложку существующей манги' })
  @ApiParam({ name: 'id', type: Number, description: 'ID манги' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Файл новой обложки манги',
    schema: {
      type: 'object',
      properties: {
        cover: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения (JPEG, PNG, WEBP, максимум 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Обложка манги успешно обновлена',
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          description: 'URL новой обложки',
        },
        oldImageUrl: {
          type: 'string',
          description: 'URL старой обложки (удаленной)',
        },
        message: {
          type: 'string',
          example: 'Обложка манги успешно обновлена',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Манга не найдена',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный файл или параметры',
  })
  async updateMangaCover(
    @Param('id', ParseIntPipe) mangaId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл новой обложки обязателен');
    }

    try {
      // Получаем существующую мангу
      const existingManga = await this.mangaService.findOne(mangaId);
      if (!existingManga) {
        throw new NotFoundException('Манга не найдена');
      }

      // Валидация файла
      S3Service.validateImageFile(file);

      // Загружаем новую обложку
      const newImageUrl = await this.s3Service.uploadFile(file, 'covers');

      // Удаляем старую обложку, если она была загружена через S3
      const oldImageUrl = existingManga.imageUrl;
      if (oldImageUrl && oldImageUrl.includes('storage.yandexcloud.net')) {
        try {
          await this.s3Service.deleteFile(oldImageUrl);
        } catch (deleteError) {
          console.warn('Не удалось удалить старую обложку:', deleteError.message);
        }
      }

      // Обновляем мангу с новой обложкой
      await this.mangaService.update(mangaId, {
        imageUrl: newImageUrl,
      });

      return {
        imageUrl: newImageUrl,
        oldImageUrl,
        message: 'Обложка манги успешно обновлена',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Ошибка обновления обложки',
      );
    }
  }
}