import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn, Relation } from "typeorm"
import { Wallet } from "./Wallet"
import {Transaction} from "./Transaction";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true, length: 100 })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    isEmailVerified: boolean;

    @Column()
    password: string;

    @OneToOne(() => Wallet, wallet => wallet.user)
    @JoinColumn()
    wallet: Relation<Wallet>

    @OneToMany(() => Transaction, transaction => transaction.sender)
    sentTransactions: Relation<Transaction>[]

    @OneToMany(() => Transaction, transaction => transaction.recipient)
    receivedTransactions: Relation<Transaction>[]

    @Column()
    createdAt: Date

    @Column()
    updatedAt: Date
}
