import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('accounts')
export class User {
    @PrimaryGeneratedColumn('uuid')

    id!: string;

    @Column({ unique: true })

    username!: string;

    @Column({ unique: true })

    email!: string;

    @Column({ select: false })

    password!: string;
}