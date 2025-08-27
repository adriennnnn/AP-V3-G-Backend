import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus, SubscriptionType } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    private usersService: UsersService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const user = await this.usersService.findOne(createSubscriptionDto.userId);
    
    const newSubscription = this.subscriptionsRepository.create({
      ...createSubscriptionDto,
      user,
      startDate: new Date(createSubscriptionDto.startDate),
      endDate: new Date(createSubscriptionDto.endDate),
    });
    
    return this.subscriptionsRepository.save(newSubscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      relations: ['user']
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
      relations: ['user']
    });
    
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    
    return subscription;
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { user: { id: userId } },
      relations: ['user']
    });
  }

  async findByStatus(status: SubscriptionStatus): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { status },
      relations: ['user']
    });
  }

  async findByType(type: SubscriptionType): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { type },
      relations: ['user']
    });
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    if (updateSubscriptionDto.userId) {
      const user = await this.usersService.findOne(updateSubscriptionDto.userId);
      subscription.user = user;
    }
    
    if (updateSubscriptionDto.startDate) {
      subscription.startDate = new Date(updateSubscriptionDto.startDate);
    }
    
    if (updateSubscriptionDto.endDate) {
      subscription.endDate = new Date(updateSubscriptionDto.endDate);
    }
    
    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionsRepository.save(subscription);
  }

  async remove(id: string): Promise<void> {
    const result = await this.subscriptionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
  }

  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptionsRepository.save(subscription);
  }

  async renew(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Only active subscriptions can be renewed');
    }
    
    // Extend the end date by the same duration
    const duration = subscription.endDate.getTime() - subscription.startDate.getTime();
    subscription.endDate = new Date(subscription.endDate.getTime() + duration);
    
    return this.subscriptionsRepository.save(subscription);
  }

  async checkExpiredSubscriptions(): Promise<Subscription[]> {
    const now = new Date();
    const expiredSubscriptions = await this.subscriptionsRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Expired more than 24 hours ago
      },
      relations: ['user']
    });
    
    // Update status to expired
    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionsRepository.save(subscription);
    }
    
    return expiredSubscriptions;
  }
}
