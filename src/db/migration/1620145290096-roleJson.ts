import type {MigrationInterface, QueryRunner} from "typeorm";

export class roleJson1620145290096 implements MigrationInterface {
    name = 'roleJson1620145290096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_entity` CHANGE `roles` `rolesJson` json NOT NULL");
        await queryRunner.query("ALTER TABLE `user_entity` DROP COLUMN `rolesJson`");
        await queryRunner.query("ALTER TABLE `user_entity` ADD `rolesJson` varchar(30) NOT NULL DEFAULT '[0]'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_entity` DROP COLUMN `rolesJson`");
        await queryRunner.query("ALTER TABLE `user_entity` ADD `rolesJson` json NOT NULL");
        await queryRunner.query("ALTER TABLE `user_entity` CHANGE `rolesJson` `roles` json NOT NULL");
    }

}
