import type {MigrationInterface, QueryRunner} from "typeorm";

export class rolesJsonField1620323897500 implements MigrationInterface {
    name = 'rolesJsonField1620323897500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_entity` CHANGE `rolesJson` `roles` varchar(30) NOT NULL DEFAULT '[0]'");
        await queryRunner.query("ALTER TABLE `user_entity` DROP COLUMN `roles`");
        await queryRunner.query("ALTER TABLE `user_entity` ADD `roles` json NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_entity` DROP COLUMN `roles`");
        await queryRunner.query("ALTER TABLE `user_entity` ADD `roles` varchar(30) NOT NULL DEFAULT '[0]'");
        await queryRunner.query("ALTER TABLE `user_entity` CHANGE `roles` `rolesJson` varchar(30) NOT NULL DEFAULT '[0]'");
    }

}
