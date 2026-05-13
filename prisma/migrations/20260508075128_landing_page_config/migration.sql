-- CreateTable
CREATE TABLE "landing_page_configs" (
    "id" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL DEFAULT 8,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_page_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_page_slots" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "landing_page_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_page_slots_configId_order_key" ON "landing_page_slots"("configId", "order");

-- AddForeignKey
ALTER TABLE "landing_page_slots" ADD CONSTRAINT "landing_page_slots_configId_fkey" FOREIGN KEY ("configId") REFERENCES "landing_page_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_page_slots" ADD CONSTRAINT "landing_page_slots_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
