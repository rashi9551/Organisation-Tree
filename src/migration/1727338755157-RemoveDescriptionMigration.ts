import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDescriptionMigration1727338755157 implements MigrationInterface {
    name = 'RemoveDescriptionMigration1727338755157'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`nodes\` DROP COLUMN \`description\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`nodes\` ADD \`description\` varchar(255) NULL`);
    }

}
