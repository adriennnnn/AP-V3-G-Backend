import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

export interface CommissionCalculation {
  directCommission: number;
  indirectCommission: number;
  totalCommission: number;
}

@Injectable()
export class AffiliateService {
  constructor(
    private usersService: UsersService,
  ) {}

  async calculateCommissions(userId: string, subscriptionAmount: number): Promise<CommissionCalculation> {
    const user = await this.usersService.findOne(userId);
    if (!user.referredBy) {
      return {
        directCommission: 0,
        indirectCommission: 0,
        totalCommission: 0,
      };
    }

    // Calculate direct commission (30% or 40% if 10+ direct referrals)
    const directReferrer = await this.usersService.findByReferralCode(user.referredBy);
    if (!directReferrer) {
      return {
        directCommission: 0,
        indirectCommission: 0,
        totalCommission: 0,
      };
    }

    const directCommissionRate = directReferrer.directReferrals >= 10 ? 0.40 : 0.30;
    const directCommission = subscriptionAmount * directCommissionRate;

    // Calculate indirect commission (5% or 10% if 5+ affiliates each)
    let indirectCommission = 0;
    if (directReferrer.referredBy) {
      const indirectReferrer = await this.usersService.findByReferralCode(directReferrer.referredBy);
      if (indirectReferrer) {
        const indirectCommissionRate = indirectReferrer.directReferrals >= 5 ? 0.10 : 0.05;
        indirectCommission = subscriptionAmount * indirectCommissionRate;
      }
    }

    return {
      directCommission,
      indirectCommission,
      totalCommission: directCommission + indirectCommission,
    };
  }

  async distributeCommissions(userId: string, subscriptionAmount: number): Promise<void> {
    const user = await this.usersService.findOne(userId);
    if (!user.referredBy) {
      return;
    }

    const commissions = await this.calculateCommissions(userId, subscriptionAmount);

    // Distribute direct commission
    if (commissions.directCommission > 0) {
      const directReferrer = await this.usersService.findByReferralCode(user.referredBy);
      if (directReferrer) {
        await this.usersService.updateEarnings(directReferrer.id, commissions.directCommission, true);
      }
    }

    // Distribute indirect commission
    if (commissions.indirectCommission > 0) {
      const directReferrer = await this.usersService.findByReferralCode(user.referredBy);
      if (directReferrer && directReferrer.referredBy) {
        const indirectReferrer = await this.usersService.findByReferralCode(directReferrer.referredBy);
        if (indirectReferrer) {
          await this.usersService.updateEarnings(indirectReferrer.id, commissions.indirectCommission, true);
        }
      }
    }
  }

  async getAffiliateStats(userId: string): Promise<any> {
    const user = await this.usersService.findOne(userId);
    const directReferrals = await this.usersService.getDirectReferrals(userId);
    const indirectReferrals = await this.usersService.getIndirectReferrals(userId);

    // Calculate commission rates
    const directCommissionRate = user.directReferrals >= 10 ? 0.40 : 0.30;
    const indirectCommissionRate = user.directReferrals >= 5 ? 0.10 : 0.05;

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        totalEarnings: user.totalEarnings,
        pendingEarnings: user.pendingEarnings,
        directReferrals: user.directReferrals,
        indirectReferrals: user.indirectReferrals,
        directCommissionRate: directCommissionRate * 100,
        indirectCommissionRate: indirectCommissionRate * 100,
      },
      directReferrals: directReferrals.map(ref => ({
        id: ref.id,
        username: ref.username,
        email: ref.email,
        createdAt: ref.createdAt,
      })),
      indirectReferrals: indirectReferrals.map(ref => ({
        id: ref.id,
        username: ref.username,
        email: ref.email,
        createdAt: ref.createdAt,
      })),
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`,
    };
  }

  async getReferralTree(userId: string): Promise<any> {
    const user = await this.usersService.findOne(userId);
    const directReferrals = await this.usersService.getDirectReferrals(userId);
    
    const referralTree = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
      },
      directReferrals: [],
    };

    for (const direct of directReferrals) {
      const indirectReferrals = await this.usersService.getIndirectReferrals(direct.id);
      referralTree.directReferrals.push({
        id: direct.id,
        username: direct.username,
        email: direct.email,
        createdAt: direct.createdAt,
        indirectReferrals: indirectReferrals.map(indirect => ({
          id: indirect.id,
          username: indirect.username,
          email: indirect.email,
          createdAt: indirect.createdAt,
        })),
      });
    }

    return referralTree;
  }
}
