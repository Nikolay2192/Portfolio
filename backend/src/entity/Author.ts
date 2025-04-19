import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Book } from "./Book.js";

@Entity('authors')
export class Author {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })

    slug!: string;

    @Column()
    name!: string;

    @OneToMany(() => Book, book => book.author)

    books!: Book[];
}