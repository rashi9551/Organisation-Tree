import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1727340333759 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE nodes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type ENUM('organization', 'location', 'employee', 'department') NOT NULL,
                color VARCHAR(50) DEFAULT 'white',
                parentId INT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Added createdAt column
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Added updatedAt column
                FOREIGN KEY (parentId) REFERENCES nodes(id) ON DELETE SET NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE nodes;`);
    }

}
