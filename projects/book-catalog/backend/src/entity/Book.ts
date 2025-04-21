import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation, Index } from "typeorm";
import { BookType } from "../enums/bookTypeEnum.js";
import { Library } from "./Library.js";
import { Author } from "./Author.js";

@Entity('books')
export class Book {
    @PrimaryGeneratedColumn('uuid')

    id!: string;

    @Column({ unique: true })

    title!: string;

    @Column({ unique: true })

    slug!: string;

    @ManyToOne(() => Author, author => author.books)

    author!: Author;

    @Column()
    @Index()

    type!: BookType;

    @ManyToOne(() => Library, library => library.books ,{ onDelete: "CASCADE" })

    library!: Relation<Library>;
}