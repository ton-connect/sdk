import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

export enum USER_ROLE {
    USER = 'user',
    WALLET = 'wallet',
    ADMIN = 'admin'
}

@Entity({ name: 'user' })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    login: string;

    @Column({ nullable: true, type: 'text' })
    walletName?: string | null;

    @Column()
    passwordHash: string;

    @Column({ type: 'enum', enum: USER_ROLE })
    role: USER_ROLE;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}
