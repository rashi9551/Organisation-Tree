import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Enum for node types
export enum NodeType {
    ORGANIZATION = 'organization',
    LOCATION = 'location',
    EMPLOYEE = 'employee',
    DEPARTMENT = 'department',
}

@Entity('nodes')
export class Node {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: NodeType,
    })
    type: NodeType;

    @Column({ default: 'white' })
    color: string;

    @Column({ nullable: true })
    @Index()
    parentId: number;

    @ManyToOne(() => Node, node => node.children, { nullable: true, onDelete: 'SET NULL' })
    parent: Node;

    @OneToMany(() => Node, node => node.parent)
    children: Node[];

    // Automatically managed timestamp for entity creation
    @CreateDateColumn()
    createdAt: Date;

    // Automatically managed timestamp for the last update
    @UpdateDateColumn()
    updatedAt: Date;
}
