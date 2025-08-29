import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';

export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  SUBSCRIBER = 'subscriber',
  USER = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Affiliation fields
  @Column({ unique: true, nullable: true })
  referralCode: string;

  @Column({ nullable: true })
  referredBy: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingEarnings: number;

  @Column({ default: 0 })
  directReferrals: number;

  @Column({ default: 0 })
  indirectReferrals: number;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];
}
