import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('YANDEX_BUCKET_NAME');

    this.s3Client = new S3Client({
      region: 'ru-central1',
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('YANDEX_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('YANDEX_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Загрузка файла в S3
   * @param file - файл для загрузки
   * @param folder - папка в бакете (опционально)
   * @returns URL загруженного файла
   */
  async uploadFile(file: Express.Multer.File, folder?: string): Promise<string> {
    const fileKey = this.generateFileKey(file.originalname, folder);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    try {
      await this.s3Client.send(command);
      const fileUrl = `https://storage.yandexcloud.net/${this.bucketName}/${fileKey}`;

      this.logger.log(`Файл загружен: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      this.logger.error(`Ошибка загрузки файла: ${error.message}`);
      throw error;
    }
  }

  /**
   * Удаление файла из S3
   * @param fileUrl - URL файла для удаления
   */
  async deleteFile(fileUrl: string): Promise<void> {
    const fileKey = this.extractKeyFromUrl(fileUrl);

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`Файл удален: ${fileKey}`);
    } catch (error) {
      this.logger.error(`Ошибка удаления файла: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получение подписанной ссылки для доступа к файлу
   * @param fileKey - ключ файла в S3
   * @param expiresIn - время действия ссылки в секундах (по умолчанию 1 час)
   * @returns подписанная ссылка
   */
  async getSignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    try {
      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      this.logger.error(`Ошибка создания подписанной ссылки: ${error.message}`);
      throw error;
    }
  }

  /**
   * Генерация уникального ключа для файла
   * @param originalName - оригинальное имя файла
   * @param folder - папка (опционально)
   * @returns уникальный ключ файла
   */
  private generateFileKey(originalName: string, folder?: string): string {
    const fileExtension = path.extname(originalName);
    const fileName = path.basename(originalName, fileExtension);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');

    const uniqueFileName = `${fileName}_${timestamp}_${randomString}${fileExtension}`;

    return folder ? `${folder}/${uniqueFileName}` : uniqueFileName;
  }

  /**
   * Извлечение ключа файла из URL
   * @param fileUrl - URL файла
   * @returns ключ файла
   */
  private extractKeyFromUrl(fileUrl: string): string {
    const url = new URL(fileUrl);
    // Убираем слэш в начале и название бакета
    return url.pathname.substring(1).replace(`${this.bucketName}/`, '');
  }

  /**
   * Валидация файла изображения
   * @param file - файл для валидации
   * @returns true если файл валиден
   */
  static validateImageFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Допустимы только файлы форматов JPEG, PNG, WEBP');
    }

    if (file.size > maxSizeInBytes) {
      throw new Error('Размер файла не должен превышать 5MB');
    }

    return true;
  }
}