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
    prisma.publisher.create({
      data: {
        name: 'Square Enix',
        description: 'Известное издательство игр и манги',
        country: 'Japan',
        website: 'https://www.square-enix.com/',
      },
    }),
    prisma.publisher.create({
      data: {
        name: 'ASCII Media Works',
        description: 'Специализируется на лайт-новеллах и манге',
        country: 'Japan',
        website: 'https://asciimw.jp/',
      },
    }),
    prisma.publisher.create({
      data: {
        name: 'Hakusensha',
        description: 'Издательство сёдзё и дзёсэй манги',
        country: 'Japan',
        website: 'https://www.hakusensha.co.jp/',
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
    prisma.genre.create({
      data: {
        name: 'Фантастика',
        description: 'Научная фантастика и технологии будущего',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Психологический',
        description: 'Глубокий анализ человеческой психики',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Детектив',
        description: 'Загадки, расследования и тайны',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Спорт',
        description: 'Спортивные соревнования и достижения',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Школа',
        description: 'Школьная жизнь и подростковые проблемы',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Мистика',
        description: 'Мистические события и загадки',
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
        biography: 'Автор самой продаваемой манги в истории - One Piece',
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
        biography: 'Автор серии My Hero Academia',
        birthDate: new Date('1986-11-20'),
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Tite',
        lastName: 'Kubo',
        nationality: 'Japanese',
        biography: 'Создатель знаменитой серии Bleach',
        birthDate: new Date('1977-06-26'),
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Masashi',
        lastName: 'Kishimoto',
        nationality: 'Japanese',
        biography: 'Автор легендарной серии Naruto',
        birthDate: new Date('1974-11-08'),
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Akira',
        lastName: 'Toriyama',
        nationality: 'Japanese',
        biography: 'Создатель Dragon Ball и Dr. Slump',
        birthDate: new Date('1955-04-05'),
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'ONE',
        lastName: '',
        nationality: 'Japanese',
        biography: 'Автор One Punch Man и Mob Psycho 100',
        birthDate: new Date('1986-10-29'),
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Naoki',
        lastName: 'Urasawa',
        nationality: 'Japanese',
        biography: 'Мастер психологических триллеров, автор Monster',
        birthDate: new Date('1960-01-02'),
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Makoto',
        lastName: 'Yukimura',
        nationality: 'Japanese',
        biography: 'Автор исторических произведений Vinland Saga',
        birthDate: new Date('1976-05-08'),
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Kentaro',
        lastName: 'Miura',
        nationality: 'Japanese',
        biography: 'Легендарный создатель темного фэнтези Berserk',
        birthDate: new Date('1966-07-11'),
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Sui',
        lastName: 'Ishida',
        nationality: 'Japanese',
        biography: 'Автор популярной серии Tokyo Ghoul',
        birthDate: new Date('1986-12-28'),
      },
    }),
  ]);

  // Создание манги
  const mangas = await Promise.all([
    prisma.manga.create({
      data: {
        title: 'Attack on Titan',
        description:
          'В мире, где человечество живет за высокими стенами, защищающими от гигантских титанов, юный Эрен поклялся уничтожить всех титанов.',
        price: 699.0,
        stock: 15,
        pages: 192,
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
          'Приключения Монки Д. Луффи и его команды пиратов в поисках легендарного сокровища "One Piece".',
        price: 649.0,
        stock: 25,
        pages: 200,
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
          'История о юноше, который стал охотником на демонов, чтобы спасти свою сестру.',
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
    prisma.manga.create({
      data: {
        title: 'Bleach',
        description:
          'Ичиго Куросаки получает силы Проводника душ и сражается с пустыми - злыми духами.',
        price: 629.0,
        stock: 18,
        pages: 190,
        imageUrl: '/images/bleach.jpg',
        publisherId: publishers[2].id, // Shueisha
        isFeatured: true,
        publishDate: new Date('2001-08-07'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'Naruto',
        description:
          'История молодого ниндзя Наруто Узумаки, мечтающего стать Хокаге своей деревни.',
        price: 599.0,
        stock: 30,
        pages: 192,
        imageUrl: '/images/naruto.jpg',
        publisherId: publishers[2].id, // Shueisha
        isFeatured: true,
        publishDate: new Date('1999-09-21'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'Dragon Ball',
        description:
          'Приключения Сон Гоку в поисках семи магических шаров дракона.',
        price: 559.0,
        stock: 22,
        pages: 200,
        imageUrl: '/images/dragonball.jpg',
        publisherId: publishers[2].id, // Shueisha
        isFeatured: true,
        publishDate: new Date('1984-12-03'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'One Punch Man',
        description:
          'Сайтама - герой, который может победить любого противника одним ударом.',
        price: 519.0,
        stock: 16,
        pages: 180,
        imageUrl: '/images/opm.jpg',
        publisherId: publishers[0].id, // Shogakukan
        isFeatured: false,
        publishDate: new Date('2012-06-14'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'Monster',
        description:
          'Психологический триллер о докторе, который спас жизнь мальчику, ставшему серийным убийцей.',
        price: 749.0,
        stock: 8,
        pages: 220,
        imageUrl: '/images/monster.jpg',
        publisherId: publishers[0].id, // Shogakukan
        isFeatured: false,
        publishDate: new Date('1994-12-05'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'Vinland Saga',
        description:
          'Историческая драма о викингах и поиске истинного смысла жизни.',
        price: 689.0,
        stock: 12,
        pages: 210,
        imageUrl: '/images/vinland.jpg',
        publisherId: publishers[1].id, // Kodansha
        isFeatured: true,
        publishDate: new Date('2005-04-13'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'Berserk',
        description:
          'Темное фэнтези о наемнике Гатсе и его пути мести в мире, полном демонов.',
        price: 799.0,
        stock: 6,
        pages: 224,
        imageUrl: '/images/berserk.jpg',
        publisherId: publishers[5].id, // Hakusensha
        isFeatured: true,
        publishDate: new Date('1989-08-25'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'Tokyo Ghoul',
        description:
          'Кен Канеки становится полу-гулем после нападения и должен адаптироваться к новой жизни.',
        price: 569.0,
        stock: 14,
        pages: 192,
        imageUrl: '/images/tokyoghoul.jpg',
        publisherId: publishers[2].id, // Shueisha
        isFeatured: false,
        publishDate: new Date('2011-09-08'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'Death Note',
        description:
          'Лайт Ягами находит тетрадь смерти и решает очистить мир от преступников.',
        price: 649.0,
        stock: 20,
        pages: 200,
        imageUrl: '/images/deathnote.jpg',
        publisherId: publishers[2].id, // Shueisha
        isFeatured: true,
        publishDate: new Date('2003-12-01'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'Fullmetal Alchemist',
        description:
          'Братья Элрик ищут философский камень, чтобы восстановить свои тела.',
        price: 619.0,
        stock: 18,
        pages: 192,
        imageUrl: '/images/fma.jpg',
        publisherId: publishers[3].id, // Square Enix
        isFeatured: true,
        publishDate: new Date('2001-07-12'),
      },
    }),
    prisma.manga.create({
      data: {
        title: 'Jujutsu Kaisen',
        description:
          'Юдзи Итадори поглощает проклятый объект и вступает в мир магии и проклятий.',
        price: 589.0,
        stock: 25,
        pages: 190,
        imageUrl: '/images/jjk.jpg',
        publisherId: publishers[2].id, // Shueisha
        isFeatured: true,
        publishDate: new Date('2018-03-05'),
      },
    }),
  ]);

  // Связываем мангу с авторами
  const mangaAuthorRelations = [
    { mangaId: mangas[0].id, authorId: authors[0].id }, // Attack on Titan - Hajime Isayama
    { mangaId: mangas[1].id, authorId: authors[1].id }, // One Piece - Eiichiro Oda
    { mangaId: mangas[2].id, authorId: authors[2].id }, // Demon Slayer - Koyoharu Gotouge
    { mangaId: mangas[3].id, authorId: authors[3].id }, // My Hero Academia - Kohei Horikoshi
    { mangaId: mangas[4].id, authorId: authors[4].id }, // Bleach - Tite Kubo
    { mangaId: mangas[5].id, authorId: authors[5].id }, // Naruto - Masashi Kishimoto
    { mangaId: mangas[6].id, authorId: authors[6].id }, // Dragon Ball - Akira Toriyama
    { mangaId: mangas[7].id, authorId: authors[7].id }, // One Punch Man - ONE
    { mangaId: mangas[8].id, authorId: authors[8].id }, // Monster - Naoki Urasawa
    { mangaId: mangas[9].id, authorId: authors[9].id }, // Vinland Saga - Makoto Yukimura
    { mangaId: mangas[10].id, authorId: authors[10].id }, // Berserk - Kentaro Miura
    { mangaId: mangas[11].id, authorId: authors[11].id }, // Tokyo Ghoul - Sui Ishida
    { mangaId: mangas[12].id, authorId: authors[8].id }, // Death Note - можно добавить как соавтора
    { mangaId: mangas[13].id, authorId: authors[6].id }, // Fullmetal Alchemist - добавим как другую работу автора
    { mangaId: mangas[14].id, authorId: authors[2].id }, // Jujutsu Kaisen - другой автор, но для примера
  ];

  await Promise.all(
    mangaAuthorRelations.map((relation) =>
      prisma.mangaAuthor.create({ data: relation })
    )
  );

  // Связываем мангу с жанрами (несколько жанров для каждой манги)
  const mangaGenreRelations = [
    // Attack on Titan - Экшен, Драма, Фантастика
    { mangaId: mangas[0].id, genreId: genres[0].id },
    { mangaId: mangas[0].id, genreId: genres[3].id },
    { mangaId: mangas[0].id, genreId: genres[6].id },

    // One Piece - Приключения, Комедия, Экшен
    { mangaId: mangas[1].id, genreId: genres[4].id },
    { mangaId: mangas[1].id, genreId: genres[2].id },
    { mangaId: mangas[1].id, genreId: genres[0].id },

    // Demon Slayer - Экшен, Сверхъестественное
    { mangaId: mangas[2].id, genreId: genres[0].id },
    { mangaId: mangas[2].id, genreId: genres[5].id },

    // My Hero Academia - Экшен, Приключения, Школа
    { mangaId: mangas[3].id, genreId: genres[0].id },
    { mangaId: mangas[3].id, genreId: genres[4].id },
    { mangaId: mangas[3].id, genreId: genres[10].id },

    // Bleach - Экшен, Сверхъестественное
    { mangaId: mangas[4].id, genreId: genres[0].id },
    { mangaId: mangas[4].id, genreId: genres[5].id },

    // Naruto - Экшен, Приключения
    { mangaId: mangas[5].id, genreId: genres[0].id },
    { mangaId: mangas[5].id, genreId: genres[4].id },

    // Dragon Ball - Экшен, Приключения, Комедия
    { mangaId: mangas[6].id, genreId: genres[0].id },
    { mangaId: mangas[6].id, genreId: genres[4].id },
    { mangaId: mangas[6].id, genreId: genres[2].id },

    // One Punch Man - Экшен, Комедия, Сверхъестественное
    { mangaId: mangas[7].id, genreId: genres[0].id },
    { mangaId: mangas[7].id, genreId: genres[2].id },
    { mangaId: mangas[7].id, genreId: genres[5].id },

    // Monster - Психологический, Детектив, Драма
    { mangaId: mangas[8].id, genreId: genres[7].id },
    { mangaId: mangas[8].id, genreId: genres[8].id },
    { mangaId: mangas[8].id, genreId: genres[3].id },

    // Vinland Saga - Драма, Экшен
    { mangaId: mangas[9].id, genreId: genres[3].id },
    { mangaId: mangas[9].id, genreId: genres[0].id },

    // Berserk - Экшен, Драма, Сверхъестественное
    { mangaId: mangas[10].id, genreId: genres[0].id },
    { mangaId: mangas[10].id, genreId: genres[3].id },
    { mangaId: mangas[10].id, genreId: genres[5].id },

    // Tokyo Ghoul - Экшен, Сверхъестественное, Психологический
    { mangaId: mangas[11].id, genreId: genres[0].id },
    { mangaId: mangas[11].id, genreId: genres[5].id },
    { mangaId: mangas[11].id, genreId: genres[7].id },

    // Death Note - Психологический, Детектив, Сверхъестественное
    { mangaId: mangas[12].id, genreId: genres[7].id },
    { mangaId: mangas[12].id, genreId: genres[8].id },
    { mangaId: mangas[12].id, genreId: genres[5].id },

    // Fullmetal Alchemist - Экшен, Приключения, Драма
    { mangaId: mangas[13].id, genreId: genres[0].id },
    { mangaId: mangas[13].id, genreId: genres[4].id },
    { mangaId: mangas[13].id, genreId: genres[3].id },

    // Jujutsu Kaisen - Экшен, Сверхъестественное, Школа
    { mangaId: mangas[14].id, genreId: genres[0].id },
    { mangaId: mangas[14].id, genreId: genres[5].id },
    { mangaId: mangas[14].id, genreId: genres[10].id },
  ];

  await Promise.all(
    mangaGenreRelations.map((relation) =>
      prisma.mangaGenre.create({ data: relation })
    )
  );

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
        phone: '+7 (495) 222-33-44',
        address: 'пр. Ленина, д. 25',
        city: 'Санкт-Петербург',
        isAdmin: false,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user3@example.com',
        password: hashedPassword,
        firstName: 'Дмитрий',
        lastName: 'Сидоров',
        phone: '+7 (495) 333-44-55',
        address: 'ул. Гагарина, д. 15',
        city: 'Екатеринбург',
        isAdmin: false,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user4@example.com',
        password: hashedPassword,
        firstName: 'Елена',
        lastName: 'Козлова',
        phone: '+7 (495) 444-55-66',
        address: 'ул. Мира, д. 8',
        city: 'Новосибирск',
        isAdmin: false,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user5@example.com',
        password: hashedPassword,
        firstName: 'Андрей',
        lastName: 'Николаев',
        phone: '+7 (495) 555-66-77',
        address: 'ул. Советская, д. 32',
        city: 'Казань',
        isAdmin: false,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user6@example.com',
        password: hashedPassword,
        firstName: 'Анна',
        lastName: 'Волкова',
        phone: '+7 (495) 666-77-88',
        address: 'пр. Победы, д. 18',
        city: 'Ростов-на-Дону',
        isAdmin: false,
        isActive: true,
      },
    }),
  ]);

  // Создание заказов
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-001',
        status: 'DELIVERED',
        totalAmount: 1248.0,
        userId: users[1].id,
        shippingAddress: 'ул. Пушкина, д. 10',
        shippingCity: 'Москва',
        shippingPhone: '+7 (495) 111-22-33',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-22'),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-002',
        status: 'SHIPPED',
        totalAmount: 1198.0,
        userId: users[2].id,
        shippingAddress: 'пр. Ленина, д. 25',
        shippingCity: 'Санкт-Петербург',
        shippingPhone: '+7 (495) 222-33-44',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-12'),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-003',
        status: 'PROCESSING',
        totalAmount: 1569.0,
        userId: users[3].id,
        shippingAddress: 'ул. Гагарина, д. 15',
        shippingCity: 'Екатеринбург',
        shippingPhone: '+7 (495) 333-44-55',
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-21'),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-004',
        status: 'PENDING',
        totalAmount: 1749.0,
        userId: users[4].id,
        shippingAddress: 'ул. Мира, д. 8',
        shippingCity: 'Новосибирск',
        shippingPhone: '+7 (495) 444-55-66',
        createdAt: new Date('2024-02-25'),
        updatedAt: new Date('2024-02-25'),
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-005',
        status: 'DELIVERED',
        totalAmount: 2238.0,
        userId: users[5].id,
        shippingAddress: 'ул. Советская, д. 32',
        shippingCity: 'Казань',
        shippingPhone: '+7 (495) 555-66-77',
        createdAt: new Date('2024-01-28'),
        updatedAt: new Date('2024-02-05'),
      },
    }),
  ]);

  // Создание элементов заказов
  await Promise.all([
    // Заказ 1 - Attack on Titan + One Piece
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        mangaId: mangas[0].id, // Attack on Titan
        quantity: 1,
        price: 699.0,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        mangaId: mangas[1].id, // One Piece
        quantity: 1,
        price: 649.0,
      },
    }),

    // Заказ 2 - Demon Slayer + My Hero Academia
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        mangaId: mangas[2].id, // Demon Slayer
        quantity: 1,
        price: 549.0,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        mangaId: mangas[3].id, // My Hero Academia
        quantity: 1,
        price: 579.0,
      },
    }),

    // Заказ 3 - Bleach + Naruto + Dragon Ball
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        mangaId: mangas[4].id, // Bleach
        quantity: 1,
        price: 629.0,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        mangaId: mangas[5].id, // Naruto
        quantity: 1,
        price: 599.0,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        mangaId: mangas[6].id, // Dragon Ball
        quantity: 1,
        price: 559.0,
      },
    }),

    // Заказ 4 - Monster + Berserk
    prisma.orderItem.create({
      data: {
        orderId: orders[3].id,
        mangaId: mangas[8].id, // Monster
        quantity: 1,
        price: 749.0,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[3].id,
        mangaId: mangas[10].id, // Berserk
        quantity: 1,
        price: 799.0,
      },
    }),

    // Заказ 5 - Death Note + Fullmetal Alchemist + Jujutsu Kaisen
    prisma.orderItem.create({
      data: {
        orderId: orders[4].id,
        mangaId: mangas[12].id, // Death Note
        quantity: 1,
        price: 649.0,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[4].id,
        mangaId: mangas[13].id, // Fullmetal Alchemist
        quantity: 1,
        price: 619.0,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[4].id,
        mangaId: mangas[14].id, // Jujutsu Kaisen
        quantity: 2,
        price: 589.0,
      },
    }),
  ]);

  // Создание отзывов
  await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Невероятная история! Сюжет захватывает с первых страниц. Рекомендую всем любителям экшена.',
        userId: users[1].id,
        mangaId: mangas[0].id, // Attack on Titan
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'One Piece - это легенда! Уже много лет слежу за приключениями Луффи и его команды.',
        userId: users[2].id,
        mangaId: mangas[1].id, // One Piece
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment:
          'Красивая анимация и интересные персонажи. Немного затянуто в некоторых местах, но в целом отлично.',
        userId: users[1].id,
        mangaId: mangas[2].id, // Demon Slayer
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment:
          'Хорошая манга про супергероев. Нравится идея с академией и развитием персонажей.',
        userId: users[2].id,
        mangaId: mangas[3].id, // My Hero Academia
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Bleach всегда останется одной из моих любимых. Ичиго - великолепный главный герой!',
        userId: users[3].id,
        mangaId: mangas[4].id, // Bleach
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Наруто - это классика! История о том, как никто не может стать кем угодно.',
        userId: users[4].id,
        mangaId: mangas[5].id, // Naruto
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Dragon Ball заложил основы для многих современных манг. Торияма - гений!',
        userId: users[5].id,
        mangaId: mangas[6].id, // Dragon Ball
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment:
          'ONE знает, как делать пародии на супергероев. Сайтама просто великолепен!',
        userId: users[1].id,
        mangaId: mangas[7].id, // One Punch Man
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Monster - это шедевр психологического жанра. Урасава превзошел себя.',
        userId: users[6].id,
        mangaId: mangas[8].id, // Monster
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Vinland Saga показывает, что значит быть настоящим воином. Глубокая история.',
        userId: users[2].id,
        mangaId: mangas[9].id, // Vinland Saga
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Berserk - темное фэнтези на высшем уровне. Покойся с миром, Миура-сенсей.',
        userId: users[3].id,
        mangaId: mangas[10].id, // Berserk
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment:
          'Tokyo Ghoul имеет уникальную атмосферу. Канеки проходит невероятное развитие.',
        userId: users[4].id,
        mangaId: mangas[11].id, // Tokyo Ghoul
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Death Note - интеллектуальная битва между Лайтом и L. Гениально написано!',
        userId: users[5].id,
        mangaId: mangas[12].id, // Death Note
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Fullmetal Alchemist идеально сбалансирован. Экшен, драма, философия - все есть.',
        userId: users[6].id,
        mangaId: mangas[13].id, // Fullmetal Alchemist
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment:
          'Jujutsu Kaisen приносит свежий взгляд на жанр сверхъестественного. Отличная анимация!',
        userId: users[1].id,
        mangaId: mangas[14].id, // Jujutsu Kaisen
      },
    }),
    // Дополнительные отзывы для большего разнообразия
    prisma.review.create({
      data: {
        rating: 4,
        comment:
          'Перечитываю уже третий раз. Каждый раз нахожу новые детали в сюжете.',
        userId: users[3].id,
        mangaId: mangas[0].id, // Attack on Titan
      },
    }),
    prisma.review.create({
      data: {
        rating: 3,
        comment:
          'Хорошая манга, но иногда слишком растянуто. Можно было бы сократить некоторые арки.',
        userId: users[4].id,
        mangaId: mangas[1].id, // One Piece
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Эмоциональная глубина персонажей просто поражает. Рекомендую всем!',
        userId: users[5].id,
        mangaId: mangas[2].id, // Demon Slayer
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment:
          'Интересная система сил и хорошо проработанный мир. Нравится развитие героя.',
        userId: users[6].id,
        mangaId: mangas[3].id, // My Hero Academia
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'One Punch Man доказывает, что пародия может быть серьезным произведением.',
        userId: users[2].id,
        mangaId: mangas[7].id, // One Punch Man
      },
    }),
  ]);

  console.log('База данных успешно заполнена тестовыми данными!');
  console.log(`Создано: ${mangas.length} манг`);
  console.log(`Создано: ${users.length} пользователей`);
  console.log(`Создано: ${orders.length} заказов`);
  console.log(`Создано: 20 отзывов`);
  console.log(`Создано: ${authors.length} авторов`);
  console.log(`Создано: ${genres.length} жанров`);
  console.log(`Создано: ${publishers.length} издательств`);

  console.log('\nТестовые аккаунты:');
  console.log('Администратор: admin@manga-store.ru / password123');
  console.log('Пользователь 1: user1@example.com / password123');
  console.log('Пользователь 2: user2@example.com / password123');
  console.log('Пользователь 3: user3@example.com / password123');
  console.log('Пользователь 4: user4@example.com / password123');
  console.log('Пользователь 5: user5@example.com / password123');
  console.log('Пользователь 6: user6@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });