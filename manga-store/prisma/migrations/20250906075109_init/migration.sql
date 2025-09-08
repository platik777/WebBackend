-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."publishers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "publishers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."authors" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "pseudonym" TEXT,
    "biography" TEXT,
    "birth_date" TIMESTAMP(3),
    "nationality" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."genres" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mangas" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isbn" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "discount_price" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "pages" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'Russian',
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "publish_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "publisher_id" INTEGER NOT NULL,

    CONSTRAINT "mangas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."manga_authors" (
    "id" SERIAL NOT NULL,
    "manga_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,

    CONSTRAINT "manga_authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."manga_genres" (
    "id" SERIAL NOT NULL,
    "manga_id" INTEGER NOT NULL,
    "genre_id" INTEGER NOT NULL,

    CONSTRAINT "manga_genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" SERIAL NOT NULL,
    "order_number" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total_amount" DECIMAL(10,2) NOT NULL,
    "shipping_address" TEXT NOT NULL,
    "shipping_city" TEXT NOT NULL,
    "shipping_phone" TEXT NOT NULL,
    "payment_method" TEXT,
    "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "shipped_at" TIMESTAMP(3),
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "order_id" INTEGER NOT NULL,
    "manga_id" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "manga_id" INTEGER NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "publishers_name_key" ON "public"."publishers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "public"."genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mangas_isbn_key" ON "public"."mangas"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "manga_authors_manga_id_author_id_key" ON "public"."manga_authors"("manga_id", "author_id");

-- CreateIndex
CREATE UNIQUE INDEX "manga_genres_manga_id_genre_id_key" ON "public"."manga_genres"("manga_id", "genre_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "public"."orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_order_id_manga_id_key" ON "public"."order_items"("order_id", "manga_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_manga_id_key" ON "public"."reviews"("user_id", "manga_id");

-- AddForeignKey
ALTER TABLE "public"."mangas" ADD CONSTRAINT "mangas_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."manga_authors" ADD CONSTRAINT "manga_authors_manga_id_fkey" FOREIGN KEY ("manga_id") REFERENCES "public"."mangas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."manga_authors" ADD CONSTRAINT "manga_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."manga_genres" ADD CONSTRAINT "manga_genres_manga_id_fkey" FOREIGN KEY ("manga_id") REFERENCES "public"."mangas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."manga_genres" ADD CONSTRAINT "manga_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_manga_id_fkey" FOREIGN KEY ("manga_id") REFERENCES "public"."mangas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_manga_id_fkey" FOREIGN KEY ("manga_id") REFERENCES "public"."mangas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
