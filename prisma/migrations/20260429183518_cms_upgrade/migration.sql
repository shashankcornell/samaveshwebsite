-- AlterTable
ALTER TABLE "content_types" ADD COLUMN     "description" TEXT,
ADD COLUMN     "thumbnailRatio" TEXT NOT NULL DEFAULT '3:4',
ADD COLUMN     "thumbnailRatioH" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "thumbnailRatioW" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "contents" ADD COLUMN     "imageAlt" TEXT,
ADD COLUMN     "imageCaption" TEXT,
ADD COLUMN     "imageCredit" TEXT;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "affiliation" TEXT,
ADD COLUMN     "customRole" TEXT,
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "topic_tags" ADD COLUMN     "bgColor" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "longIntro" TEXT,
ADD COLUMN     "sectorImage" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "gazettes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "volumeNumber" INTEGER,
    "editionName" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "place" TEXT,
    "subheading" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "coverImageAlt" TEXT,
    "editorNote" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "disclaimer" TEXT,
    "credits" TEXT,
    "acknowledgements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gazettes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gazette_articles" (
    "gazetteId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gazette_articles_pkey" PRIMARY KEY ("gazetteId","contentId")
);

-- CreateTable
CREATE TABLE "gazette_editorial_board_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gazette_editorial_board_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gazette_editorial_members" (
    "id" TEXT NOT NULL,
    "gazetteId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "roleId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gazette_editorial_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "heroHeading" TEXT,
    "heroSubtitle" TEXT,
    "bgColor" TEXT DEFAULT '#ffffff',
    "textColor" TEXT DEFAULT '#111111',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gazettes_slug_key" ON "gazettes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "gazette_editorial_board_roles_name_key" ON "gazette_editorial_board_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- AddForeignKey
ALTER TABLE "gazette_articles" ADD CONSTRAINT "gazette_articles_gazetteId_fkey" FOREIGN KEY ("gazetteId") REFERENCES "gazettes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gazette_articles" ADD CONSTRAINT "gazette_articles_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gazette_editorial_members" ADD CONSTRAINT "gazette_editorial_members_gazetteId_fkey" FOREIGN KEY ("gazetteId") REFERENCES "gazettes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gazette_editorial_members" ADD CONSTRAINT "gazette_editorial_members_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gazette_editorial_members" ADD CONSTRAINT "gazette_editorial_members_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "gazette_editorial_board_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "cms_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
