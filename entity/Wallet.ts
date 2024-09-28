import { Entity, PrimaryGeneratedColumn, Column, OneToOne, Relation} from "typeorm";
import {User} from "./User";

@Entity()
export class Wallet {

    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column("decimal", { precision: 10, scale: 2 })
    balance!: number

    @Column({ length: 3 })
    currency!: string

    @OneToOne(() => User, user => user.wallet)
    user!: Relation<User>

    @Column()
    createdAt!: Date

    @Column()
    updatedAt!: Date
}