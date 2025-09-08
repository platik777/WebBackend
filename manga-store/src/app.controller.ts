import { Controller, Get, Render, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getHomePage(@Query('auth') isAuthenticated?: string) {
    return {
      title: 'Manga Store - Главная',
      user:
        isAuthenticated === 'true'
          ? {
              name: 'Пользователь',
              email: 'user@example.com',
              isAuthenticated: true,
            }
          : null,
      featuredMangas: [
        {
          id: 1,
          title: 'Attack on Titan',
          author: 'Hajime Isayama',
          price: 599,
          image: '/images/aot.jpg',
          description:
            'Эпическая история о человечестве, борющемся за выживание против титанов.',
          inStock: true,
        },
        {
          id: 2,
          title: 'One Piece',
          author: 'Eiichiro Oda',
          price: 699,
          image: '/images/onepiece.jpg',
          description:
            'Приключения Монки Д. Луффи в поисках легендарного сокровища.',
          inStock: true,
        },
        {
          id: 3,
          title: 'Demon Slayer',
          author: 'Koyoharu Gotouge',
          price: 549,
          image: '/images/demonslayer.jpg',
          description: 'История юноши, ставшего охотником на демонов.',
          inStock: true,
        },
      ],
    };
  }

  @Get('catalog')
  @Render('catalog')
  getCatalogPage(@Query('auth') isAuthenticated?: string) {
    return {
      title: 'Каталог манги',
      user:
        isAuthenticated === 'true'
          ? {
              name: 'Пользователь',
              email: 'user@example.com',
              isAuthenticated: true,
            }
          : null,
      mangas: [
        {
          id: 1,
          title: 'Attack on Titan',
          author: 'Hajime Isayama',
          price: 599,
          image: '/images/aot.jpg',
          genre: 'Экшен, Драма',
          inStock: true,
        },
        {
          id: 2,
          title: 'One Piece',
          author: 'Eiichiro Oda',
          price: 699,
          image: '/images/onepiece.jpg',
          genre: 'Приключения, Комедия',
          inStock: true,
        },
        {
          id: 3,
          title: 'Demon Slayer',
          author: 'Koyoharu Gotouge',
          price: 549,
          image: '/images/demonslayer.jpg',
          genre: 'Экшен, Сверхъестественное',
          inStock: false,
        },
        {
          id: 4,
          title: 'My Hero Academia',
          author: 'Kohei Horikoshi',
          price: 579,
          image: '/images/mha.jpg',
          genre: 'Супергерои, Школа',
          inStock: true,
        },
      ],
    };
  }

  @Get('about')
  @Render('about')
  getAboutPage(@Query('auth') isAuthenticated?: string) {
    return {
      title: 'О нас',
      user:
        isAuthenticated === 'true'
          ? {
              name: 'Пользователь',
              email: 'user@example.com',
              isAuthenticated: true,
            }
          : null,
    };
  }
}
