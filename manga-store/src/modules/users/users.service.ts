import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';
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

  async findAllPaginated(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const options = PaginationUtil.buildPaginationOptions(paginationQuery);
    const { skip, take } = PaginationUtil.buildSkipTake(options);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { isActive: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { isActive: true } }),
    ]);

    const userResponses = users.map((user) => new UserResponseDto(new User(user).toPublicProfile()));

    return PaginationUtil.buildPaginatedResponse(
      userResponses,
      options,
      total,
      '/api/users',
    );
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return new User(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? new User(user) : null;
  }

  async getUserOrders(id: number) {
    await this.findOne(id); 

    return this.prisma.order.findMany({
      where: { userId: id },
      include: {
        orderItems: {
          include: {
            manga: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserReviews(id: number) {
    await this.findOne(id); 

    return this.prisma.review.findMany({
      where: { userId: id },
      include: {
        manga: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

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
    await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}