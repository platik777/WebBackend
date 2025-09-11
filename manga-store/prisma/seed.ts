import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем заполнение базы данных...');

  // Создание издателей
  const publishers = await Promise.all([
    prisma.publisher.create({
      data: {
        name: 'Shogakukan',
        description: 'Крупнейшее японское издательство манги',
        country: 'Japan',
        website: 'https://www.shogakukan.co.jp/',
      },
    }),
    prisma.publisher.create({
      data: {
        name: 'Kodansha',
        description: 'Одно из старейших издательств Японии',
        country: 'Japan',
        website: 'https://www.kodansha.co.jp/',
      },
    }),
    prisma.publisher.create({
      data: {
        name: 'Shueisha',
        description: 'Издательство Weekly Shonen Jump',
        country: 'Japan',
        website: 'https://www.shueisha.co.jp/',
      },
    }),
  ]);

  // Создание жанров
  const genres = await Promise.all([
    prisma.genre.create({
      data: {
        name: 'Экшен',
        description: 'Боевые сцены и динамичные приключения',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Романтика',
        description: 'Любовные истории и отношения',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Комедия',
        description: 'Юмористические истории',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Драма',
        description: 'Серьезные и эмоциональные сюжеты',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Приключения',
        description: 'Путешествия и открытия',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Сверхъестественное',
        description: 'Магия, демоны и сверхъестественные силы',
      },
    }),
  ]);

  // Создание авторов
  const authors = await Promise.all([
    prisma.author.create({
      data: {
        firstName: 'Hajime',
        lastName: 'Isayama',
        nationality: 'Japanese',
        biography: 'Создатель легендарной серии Attack on Titan',
        birthDate: new Date('1986-08-29'),
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Eiichiro',
        lastName: 'Oda',
        nationality: 'Japanese',
        biography: 'Автор самой продаваемой манги всех времен - One Piece',
        birthDate: new Date('1975-01-01'),
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Koyoharu',
        lastName: 'Gotouge',
        nationality: 'Japanese',
        biography: 'Создатель популярной серии Demon Slayer',
        birthDate: new Date('1989-05-05'),
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Kohei',
        lastName: 'Horikoshi',
        nationality: 'Japanese',
        biography: 'Автор супергеройской манги My Hero Academia',
        birthDate: new Date('1986-11-20'),
      },
    }),
  ]);

  // Создание манги
  const mangas = await Promise.all([
    prisma.manga.create({
      data: {
        title: 'Attack on Titan',
        description:
          'Эпическая история о человечестве, борющемся за выживание против титанов в постапокалиптическом мире.',
        price: 599.0,
        stock: 15,
        pages: 200,
        imageUrl: '/images/aot.jpg',
        publisherId: publishers[1].id, // Kodansha
        isFeatured: true,
        publishDate: new Date('2009-09-09'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'One Piece',
        description:
          'Приключения Монки Д. Луффи и его команды пиратов в поисках легендарного сокровища One Piece.',
        price: 699.0,
        stock: 25,
        pages: 192,
        imageUrl: '/images/onepiece.jpg',
        publisherId: publishers[2].id, // Shueisha
        isFeatured: true,
        publishDate: new Date('1997-07-22'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'Demon Slayer',
        description:
          'История Танджиро Камадо, ставшего охотником на демонов после трагедии в его семье.',
        price: 549.0,
        stock: 0, // Нет в наличии
        pages: 208,
        imageUrl: '/images/demonslayer.jpg',
        publisherId: publishers[2].id, // Shueisha
        isFeatured: true,
        publishDate: new Date('2016-02-15'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'My Hero Academia',
        description:
          'В мире, где большинство людей обладают суперсилами, юный Изуку мечтает стать героем.',
        price: 579.0,
        stock: 20,
        pages: 216,
        imageUrl: '/images/mha.jpg',
        publisherId: publishers[2].id, // Shueisha
        isFeatured: false,
        publishDate: new Date('2014-07-07'),
      },
    }),
  ]);

  // Связываем мангу с авторами
  await Promise.all([
    prisma.mangaAuthor.create({
      data: { mangaId: mangas[0].id, authorId: authors[0].id },
    }),
    prisma.mangaAuthor.create({
      data: { mangaId: mangas[1].id, authorId: authors[1].id },
    }),
    prisma.mangaAuthor.create({
      data: { mangaId: mangas[2].id, authorId: authors[2].id },
    }),
    prisma.mangaAuthor.create({
      data: { mangaId: mangas[3].id, authorId: authors[3].id },
    }),
  ]);

  // Связываем мангу с жанрами
  await Promise.all([
    // Attack on Titan - Экшен, Драма
    prisma.mangaGenre.create({
      data: { mangaId: mangas[0].id, genreId: genres[0].id },
    }),
    prisma.mangaGenre.create({
      data: { mangaId: mangas[0].id, genreId: genres[3].id },
    }),
    // One Piece - Приключения, Комедия
    prisma.mangaGenre.create({
      data: { mangaId: mangas[1].id, genreId: genres[4].id },
    }),
    prisma.mangaGenre.create({
      data: { mangaId: mangas[1].id, genreId: genres[2].id },
    }),
    // Demon Slayer - Экшен, Сверхъестественное
    prisma.mangaGenre.create({
      data: { mangaId: mangas[2].id, genreId: genres[0].id },
    }),
    prisma.mangaGenre.create({
      data: { mangaId: mangas[2].id, genreId: genres[5].id },
    }),
    // My Hero Academia - Экшен, Приключения
    prisma.mangaGenre.create({
      data: { mangaId: mangas[3].id, genreId: genres[0].id },
    }),
    prisma.mangaGenre.create({
      data: { mangaId: mangas[3].id, genreId: genres[4].id },
    }),
  ]);

  // Создание пользователей
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@manga-store.ru',
        password: hashedPassword,
        firstName: 'Админ',
        lastName: 'Администратор',
        phone: '+7 (495) 123-45-67',
        address: 'ул. Аниме, д. 1',
        city: 'Москва',
        isAdmin: true,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user1@example.com',
        password: hashedPassword,
        firstName: 'Алексей',
        lastName: 'Петров',
        phone: '+7 (495) 111-22-33',
        address: 'ул. Пушкина, д. 10',
        city: 'Москва',
        isAdmin: false,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user2@example.com',
        password: hashedPassword,
        firstName: 'Мария',
        lastName: 'Иванова',
        phone: '+7 (931) 444-55-66',
        address: 'Невский проспект, д. 20',
        city: 'Санкт-Петербург',
        isAdmin: false,
        isActive: true,
      },
    }),
  ]);

  // Создание тестовых заказов
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORDER-' + Date.now() + '-001',
        status: 'DELIVERED',
        totalAmount: 1148.0,
        shippingAddress: 'ул. Пушкина, д. 10',
        shippingCity: 'Москва',
        shippingPhone: '+7 (495) 111-22-33',
        paymentMethod: 'Банковская карта',
        paymentStatus: 'PAID',
        userId: users[1].id,
        shippedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 дня назад
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORDER-' + Date.now() + '-002',
        status: 'PROCESSING',
        totalAmount: 579.0,
        shippingAddress: 'Невский проспект, д. 20',
        shippingCity: 'Санкт-Петербург',
        shippingPhone: '+7 (812) 444-55-66',
        paymentMethod: 'Наличные',
        paymentStatus: 'PENDING',
        userId: users[2].id,
      },
    }),
  ]);

  // Создание позиций заказов
  await Promise.all([
    // Первый заказ: Attack on Titan + Demon Slayer
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        mangaId: mangas[0].id,
        quantity: 1,
        price: 599.0,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        mangaId: mangas[2].id,
        quantity: 1,
        price: 549.0,
      },
    }),
    // Второй заказ: My Hero Academia
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        mangaId: mangas[3].id,
        quantity: 1,
        price: 579.0,
      },
    }),
  ]);

  // Создание отзывов
  await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Потрясающая манга! Сюжет захватывает с первых страниц. Рекомендую всем любителям экшена.',
        userId: users[1].id,
        mangaId: mangas[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'One Piece - это легенда! Уже много лет слежу за приключениями Луффи и его команды.',
        userId: users[2].id,
        mangaId: mangas[1].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment:
          'Красивая анимация и интересные персонажи. Немного затянуто в некоторых местах, но в целом отлично.',
        userId: users[1].id,
        mangaId: mangas[2].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment:
          'Хороша манга про супергероев. Нравится идея с академией и развитием персонажей.',
        userId: users[2].id,
        mangaId: mangas[3].id,
      },
    }),
  ]);

  console.log('База данных успешно заполнена тестовыми данными!');
  console.log(`Создано: ${mangas.length} манг`);
  console.log(`Создано: ${users.length} пользователей`);
  console.log(`Создано: ${orders.length} заказов`);
  console.log(`Создано: 4 отзыва`);
  console.log(`Создано: ${authors.length} авторов`);
  console.log(`Создано: ${genres.length} жанров`);
  console.log(`Создано: ${publishers.length} издательств`);

  console.log('\nТестовые аккаунты:');
  console.log('Администратор: admin@manga-store.ru / password123');
  console.log('Пользователь 1: user1@example.com / password123');
  console.log('Пользователь 2: user2@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
