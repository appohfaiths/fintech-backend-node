import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from "typeorm"
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
    wallet: Wallet

    @OneToMany(() => Transaction, transaction => transaction.sender)
    sentTransactions: Transaction[]

    @OneToMany(() => Transaction, transaction => transaction.recipient)
    receivedTransactions: Transaction[]

    @Column()
    createdAt: Date

    @Column()
    updatedAt: Date
}
