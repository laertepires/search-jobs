CREATE TABLE `CronFailureLog` (
    `id` VARCHAR(191) NOT NULL,
    `runId` VARCHAR(191) NOT NULL,
    `tenant` VARCHAR(191) NOT NULL,
    `stage` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `details` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CronFailureLog_runId_createdAt_idx`(`runId`, `createdAt`),
    INDEX `CronFailureLog_tenant_createdAt_idx`(`tenant`, `createdAt`),
    INDEX `CronFailureLog_stage_createdAt_idx`(`stage`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
