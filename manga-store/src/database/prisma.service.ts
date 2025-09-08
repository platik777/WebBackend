import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Connected to the database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Disconnected from the database');
  }

  // Utility методы для работы с транзакциями
  async enableShutdownHooks(app: any) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  // Метод для очистки базы данных (для тестирования)
  async cleanDatabase() {
    const modelNames = Reflect.ownKeys(this).filter((key) =>
      key.toString().match(/^[a-z]/),
    );

    return Promise.all(
      modelNames.map((modelName) => {
        const model = this[modelName as keyof typeof this] as any;
        if (model && typeof model.deleteMany === 'function') {
          return model.deleteMany();
        }
      }),
    );
  }
}
