import { Controller, Post, Get, Body, UseGuards, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { StripeService, SubscriptionPlan } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

class CreateSubscriptionDto {
  plan: SubscriptionPlan;
  paymentMethodId: string;
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create')
  @Roles(UserRole.USER, UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  @UsePipes(new ValidationPipe())
  async createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto, @Req() req) {
    return this.stripeService.createSubscription(
      req.user.id,
      createSubscriptionDto.plan,
      createSubscriptionDto.paymentMethodId,
    );
  }

  @Post('cancel')
  @Roles(UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  async cancelSubscription(@Req() req) {
    return this.stripeService.cancelSubscription(req.user.id);
  }

  @Post('pause')
  @Roles(UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  async pauseSubscription(@Req() req) {
    return this.stripeService.pauseSubscription(req.user.id);
  }

  @Post('resume')
  @Roles(UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  async resumeSubscription(@Req() req) {
    return this.stripeService.resumeSubscription(req.user.id);
  }

  @Get('status')
  @Roles(UserRole.USER, UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  async getSubscriptionStatus(@Req() req) {
    return this.stripeService.getSubscriptionStatus(req.user.id);
  }

  @Post('payment-intent')
  @Roles(UserRole.USER, UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  async createPaymentIntent(@Body() body: { amount: number; currency?: string }, @Req() req) {
    return this.stripeService.createPaymentIntent(body.amount, body.currency);
  }
}
