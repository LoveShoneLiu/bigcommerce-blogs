-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "storeHash" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "ownerEmail" TEXT,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uninstalledAt" TIMESTAMP(3),

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storefront_profiles" (
    "id" TEXT NOT NULL,
    "storeHash" TEXT NOT NULL,
    "stencilEnabled" BOOLEAN NOT NULL,
    "capability" TEXT NOT NULL,
    "capabilityReason" TEXT NOT NULL,
    "channelsJson" JSONB NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storefront_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL,
    "storeHash" TEXT NOT NULL,
    "themePreset" TEXT NOT NULL DEFAULT 'editorial',
    "seoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "enabledChannelIds" JSONB NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installed_scripts" (
    "id" TEXT NOT NULL,
    "storeHash" TEXT NOT NULL,
    "channelId" INTEGER NOT NULL,
    "scriptUuid" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installed_scripts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_storeHash_key" ON "stores"("storeHash");

-- CreateIndex
CREATE UNIQUE INDEX "storefront_profiles_storeHash_key" ON "storefront_profiles"("storeHash");

-- CreateIndex
CREATE UNIQUE INDEX "store_settings_storeHash_key" ON "store_settings"("storeHash");

-- CreateIndex
CREATE UNIQUE INDEX "installed_scripts_storeHash_channelId_kind_key" ON "installed_scripts"("storeHash", "channelId", "kind");

-- AddForeignKey
ALTER TABLE "storefront_profiles" ADD CONSTRAINT "storefront_profiles_storeHash_fkey" FOREIGN KEY ("storeHash") REFERENCES "stores"("storeHash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_storeHash_fkey" FOREIGN KEY ("storeHash") REFERENCES "stores"("storeHash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installed_scripts" ADD CONSTRAINT "installed_scripts_storeHash_fkey" FOREIGN KEY ("storeHash") REFERENCES "stores"("storeHash") ON DELETE CASCADE ON UPDATE CASCADE;
