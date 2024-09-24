import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import {User} from "./User";

@Entity()
export class Transaction {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column("decimal", { precision: 10, scale: 2})
    amount: number

    @Column()
    createdAt: Date

    @Column({ unique: true})
    idempotencyKey: string

    @ManyToOne(() => User, user => user.sentTransactions)
    sender: User

    @ManyToOne(() => User, user => user.receivedTransactions)
    recipient: User
}