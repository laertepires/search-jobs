-- CreateTable
CREATE TABLE `Jobs` (
    `jobId` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `workplaceType` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `XTenant` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tenantName` VARCHAR(191) NULL,

    PRIMARY KEY (`jobId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `XTenant` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
