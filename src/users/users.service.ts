import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const referralCode = this.generateReferralCode();
    
    const newUser = this.usersRepository.create({ 
      ...createUserDto, 
      password: hashedPassword,
      referralCode
    });
    
    return this.usersRepository.save(newUser);
  }

  async createWithReferral(createUserDto: CreateUserDto, referralCode?: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newReferralCode = this.generateReferralCode();
    
    const newUser = this.usersRepository.create({ 
      ...createUserDto, 
      password: hashedPassword,
      referralCode: newReferralCode,
      referredBy: referralCode
    });
    
    const savedUser = await this.usersRepository.save(newUser);
    
    // Update referrer's statistics
    if (referralCode) {
      await this.updateReferrerStats(referralCode);
    }
    
    return savedUser;
  }

  private generateReferralCode(): string {
    return uuidv4().substring(0, 8).toUpperCase();
  }

  async updateReferrerStats(referralCode: string): Promise<void> {
    const referrer = await this.usersRepository.findOne({ where: { referralCode } });
    if (referrer) {
      referrer.directReferrals += 1;
      await this.usersRepository.save(referrer);
    }
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({ where: { role } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByReferralCode(referralCode: string): Promise<User> {
    return this.usersRepository.findOne({ where: { referralCode } });
  }

  async getDirectReferrals(userId: string): Promise<User[]> {
    const user = await this.findOne(userId);
    return this.usersRepository.find({ where: { referredBy: user.referralCode } });
  }

  async getIndirectReferrals(userId: string): Promise<User[]> {
    const directReferrals = await this.getDirectReferrals(userId);
    const indirectReferrals: User[] = [];
    
    for (const direct of directReferrals) {
      const indirect = await this.usersRepository.find({ 
        where: { referredBy: direct.referralCode } 
      });
      indirectReferrals.push(...indirect);
    }
    
    return indirectReferrals;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async changeRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findOne(id);
    user.role = role;
    return this.usersRepository.save(user);
  }

  async updateEarnings(userId: string, amount: number, isPending: boolean = false): Promise<User> {
    const user = await this.findOne(userId);
    if (isPending) {
      user.pendingEarnings += amount;
    } else {
      user.totalEarnings += amount;
      user.pendingEarnings -= amount;
    }
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}