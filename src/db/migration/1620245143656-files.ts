import type {MigrationInterface, QueryRunner} from "typeorm";

export class files1620245143656 implements MigrationInterface {
    name = 'files1620245143656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `file_entity` (`id` varchar(30) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `version` int NOT NULL, `createdById` varchar(30) NULL, `name` varchar(255) NOT NULL, `type` varchar(30) NOT NULL, `size` int UNSIGNED NOT NULL, `md5` varchar(32) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user_entity` CHANGE `passwordUpdatedAt` `passwordUpdatedAt` timestamp NOT NULL");
        await queryRunner.query("ALTER TABLE `file_entity` ADD CONSTRAINT `FK_b4ac990a56e9153c713aac2ef35` FOREIGN KEY (`createdById`) REFERENCES `user_entity`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `file_entity` DROP FOREIGN KEY `FK_b4ac990a56e9153c713aac2ef35`");
        await queryRunner.query("ALTER TABLE `user_entity` CHANGE `passwordUpdatedAt` `passwordUpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        await queryRunner.query("DROP TABLE `file_entity`");
    }

}
