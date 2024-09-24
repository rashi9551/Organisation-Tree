import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

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
    type: NodeType;  // Use the enum for better type safety

    @Column({ default: 'white' })
    color: string;

    @Column({ nullable: true })
    parentId: number;

    @ManyToOne(() => Node, node => node.children, { nullable: true, onDelete: 'SET NULL' })
    parent: Node;

    @OneToMany(() => Node, node => node.parent)
    children: Node[];
}
