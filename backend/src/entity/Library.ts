import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Book } from "./Book.js";
import { BookType } from "../enums/bookTypeEnum.js";

@Entity('libraries')
export class Library {
    @PrimaryGeneratedColumn('uuid')

    id!: string;

    @Column()

    type!: BookType;

    @OneToMany(() => Book, book => book.library)

    books!: Book[];
}