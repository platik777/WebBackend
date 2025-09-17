import {
  Controller,
  Get,
  Render,
  Query,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MangaService } from './modules/manga/manga.service';
import { UsersService } from './modules/users/users.service';
import { OrdersService } from './modules/orders/orders.service';
import { ReviewsService } from './modules/reviews/reviews.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mangaService: MangaService,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  @Render('index')
  async getHomePage(@Query('auth') isAuthenticated?: string) {
    const featuredMangas = await this.mangaService.findFeatured();

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
      featuredMangas: featuredMangas.map((manga) => {
        const mangaData = manga as any;
        return {
          id: manga.id,
          title: manga.title,
          author:
            mangaData.mangaAuthors?.[0]?.author?.displayName ||
            `${mangaData.mangaAuthors?.[0]?.author?.firstName} ${mangaData.mangaAuthors?.[0]?.author?.lastName}` ||
            'Неизвестен',
          price: manga.price,
          image: manga.imageUrl || '/images/placeholder.jpg',
          description: manga.description || '',
          inStock: manga.isAvailable,
          genre:
            mangaData.mangaGenres
              ?.map((mg: any) => mg.genre?.name)
              .join(', ') || '',
        };
      }),
    };
  }

  @Get('catalog')
  @Render('catalog')
  async getCatalogPage(
    @Query('auth') isAuthenticated?: string,
    @Query() queryParams?: any,
  ) {
    const mangas = await this.mangaService.findAll();

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
      mangas: mangas.map((manga) => {
        const mangaData = manga as any;
        return {
          id: manga.id,
          title: manga.title,
          author:
            mangaData.mangaAuthors?.[0]?.author?.displayName ||
            `${mangaData.mangaAuthors?.[0]?.author?.firstName} ${mangaData.mangaAuthors?.[0]?.author?.lastName}` ||
            'Неизвестен',
          price: manga.price,
          image: manga.imageUrl || '/images/placeholder.jpg',
          description: manga.description || '',
          inStock: manga.isAvailable,
          genre:
            mangaData.mangaGenres
              ?.map((mg: any) => mg.genre?.name)
              .join(', ') || '',
        };
      }),
    };
  }

  @Get('manga/:id')
  @Render('manga-detail')
  async getMangaDetailPage(
    @Param('id', ParseIntPipe) id: number,
    @Query('auth') isAuthenticated?: string,
  ) {
    const manga = await this.mangaService.findOne(id);
    if (!manga) {
      throw new NotFoundException('Манга не найдена');
    }

    const mangaData = manga as any;

    return {
      title: `${manga.title} - Manga Store`,
      user:
        isAuthenticated === 'true'
          ? {
            name: 'Пользователь',
            email: 'user@example.com',
            isAuthenticated: true,
          }
          : null,
      manga: {
        id: manga.id,
        title: manga.title,
        author:
          mangaData.mangaAuthors?.[0]?.author?.displayName ||
          `${mangaData.mangaAuthors?.[0]?.author?.firstName} ${mangaData.mangaAuthors?.[0]?.author?.lastName}` ||
          'Неизвестен',
        price: manga.price,
        image: manga.imageUrl || '/images/placeholder.jpg',
        description: manga.description || '',
        inStock: manga.isAvailable,
        stock: manga.stock,
        genre:
          mangaData.mangaGenres
            ?.map((mg: any) => mg.genre?.name)
            .join(', ') || '',
        publisher: mangaData.publisher?.name || 'Неизвестно',
        language: 'Русский',
      },
    };
  }

  @Get('about')
  @Render('about')
  getAboutPage(@Query('auth') isAuthenticated?: string) {
    return {
      title: 'О нас - Manga Store',
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

  @Get('profile')
  @Render('profile')
  async getProfilePage(
    @Query('auth') isAuthenticated?: string,
    @Query('userId') userId?: string,
  ) {
    if (!userId) {
      return { title: 'Профиль', error: 'Необходимо войти в систему' };
    }

    const user = await this.usersService.findOne(parseInt(userId));
    const userOrders = await this.ordersService.findByUserId(parseInt(userId));
    const userReviews = await this.reviewsService.findByUserId(
      parseInt(userId),
    );

    return {
      title: 'Профиль пользователя',
      user: user
        ? {
          id: user.id,
          name: user.fullName || `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
        }
        : null,
      orders: userOrders.map((order) => {
        const orderData = order as any;
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount.toNumber(),
          createdAt: order.createdAt.toLocaleDateString('ru-RU'),
          itemsCount: orderData.orderItems?.length || 0,
        };
      }),
      reviews: userReviews.map((review) => {
        const reviewData = review as any;
        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          mangaTitle: reviewData.manga?.title || 'Неизвестная манга',
          date: review.getFormattedDate ? review.getFormattedDate() :
            new Date(review.createdAt).toLocaleDateString('ru-RU'),
        };
      }),
    };
  }

  @Get('orders')
  @Render('orders')
  async getOrdersPage(@Query('userId') userId?: string) {
    if (!userId) {
      return { title: 'Мои заказы', error: 'Необходимо войти в систему' };
    }

    const orders = await this.ordersService.findByUserId(parseInt(userId));

    return {
      title: 'Мои заказы',
      orders: orders.map((order) => {
        const orderData = order as any;
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount.toNumber(),
          createdAt: order.createdAt.toLocaleDateString('ru-RU'),
          shippingAddress: `${order.shippingCity}, ${order.shippingAddress}`,
          items:
            orderData.orderItems?.map((item: any) => ({
              title: item.manga?.title || 'Неизвестная манга',
              quantity: item.quantity,
              price: item.price.toNumber(),
            })) || [],
        };
      }),
    };
  }

  @Get('cart')
  @Render('cart')
  getCartPage(@Query('auth') isAuthenticated?: string) {
    return {
      title: 'Корзина',
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

  @Get('checkout')
  @Render('checkout')
  getCheckoutPage(@Query('auth') isAuthenticated?: string) {
    return {
      title: 'Оформление заказа',
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

  @Get('login')
  @Render('login')
  getLoginPage() {
    return {
      title: 'Вход в систему',
    };
  }

  @Get('register')
  @Render('register')
  getRegisterPage() {
    return {
      title: 'Регистрация',
    };
  }
}