import type {MigrationInterface, QueryRunner} from "typeorm";

export class rolesSimpleJsonField1620325468358 implements MigrationInterface {
    name = 'rolesSimpleJsonField1620325468358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_entity` DROP COLUMN `roles`");
        await queryRunner.query("ALTER TABLE `user_entity` ADD `roles` text NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_entity` DROP COLUMN `roles`");
        await queryRunner.query("ALTER TABLE `user_entity` ADD `roles` json NOT NULL");
    }

}
