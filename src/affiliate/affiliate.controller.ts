import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('affiliate')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Get('dashboard')
  @Roles(UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  async getDashboard(@Req() req) {
    return this.affiliateService.getAffiliateStats(req.user.id);
  }

  @Get('referral-tree')
  @Roles(UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  async getReferralTree(@Req() req) {
    return this.affiliateService.getReferralTree(req.user.id);
  }

  @Post('calculate-commission')
  @Roles(UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  async calculateCommission(@Body() body: { userId: string; amount: number }, @Req() req) {
    return this.affiliateService.calculateCommissions(body.userId, body.amount);
  }

  @Post('distribute-commission')
  @Roles(UserRole.ADMIN)
  async distributeCommission(@Body() body: { userId: string; amount: number }, @Req() req) {
    await this.affiliateService.distributeCommissions(body.userId, body.amount);
    return { message: 'Commissions distributed successfully' };
  }
}
