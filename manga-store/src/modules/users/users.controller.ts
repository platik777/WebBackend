import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ConflictException,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.usersService.findByEmail(
        createUserDto.email,
      );
      if (existingUser) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }

      const user = await this.usersService.create(createUserDto);
      return user.toPublicProfile();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Ошибка при создании пользователя');
    }
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => user.toPublicProfile());
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user.toPublicProfile();
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      return user.toPublicProfile();
    } catch (error) {
      throw new NotFoundException('Пользователь не найден');
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.usersService.remove(id);
      return { message: 'Пользователь успешно удален' };
    } catch (error) {
      throw new NotFoundException('Пользователь не найден');
    }
  }
}
