import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MangaService } from './manga.service';
import { MangaController } from './manga.controller';
import { MangaApiController } from './manga-api.controller';
import { MangaUploadController } from './manga-upload.controller';
import { MangaResolver } from './graphql/manga.resolver';
import { ReviewsModule } from '../reviews/reviews.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    forwardRef(() => ReviewsModule),
    S3Module,
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB максимум
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error('Допустимы только файлы форматов JPEG, PNG, WEBP'),
            false,
          );
        }
      },
    }),
  ],
  controllers: [
    MangaController,
    MangaApiController,
    MangaUploadController,
  ],
  providers: [MangaService, MangaResolver],
  exports: [MangaService],
})
export class MangaModule {}