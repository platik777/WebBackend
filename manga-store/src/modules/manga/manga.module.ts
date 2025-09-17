import { Module } from '@nestjs/common';
import { MangaService } from './manga.service';
import { MangaController } from './manga.controller';
import { MangaApiController } from './manga-api.controller';

@Module({
  controllers: [MangaController, MangaApiController],
  providers: [MangaService],
  exports: [MangaService],
})
export class MangaModule {}