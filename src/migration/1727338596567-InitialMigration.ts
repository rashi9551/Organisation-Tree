import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1727338596567 implements MigrationInterface {
    name = 'InitialMigration1727338596567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`nodes\` ADD \`description\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`nodes\` DROP COLUMN \`description\``);
    }

}
