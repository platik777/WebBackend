import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userData = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    return new User(userData);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => new User(user));
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? new User(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? new User(user) : null;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const updateData = { ...updateUserDto };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return new User(user);
  }

  async remove(id: number): Promise<void> {
    // Мягкое удаление - помечаем пользователя как неактивного
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
