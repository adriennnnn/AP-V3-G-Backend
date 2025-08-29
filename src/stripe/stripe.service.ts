import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

export enum SubscriptionPlan {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomer(userId: string, email: string): Promise<Stripe.Customer> {
    const user = await this.usersService.findOne(userId);
    
    const customer = await this.stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    return customer;
  }

  async createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    paymentMethodId: string,
  ): Promise<Stripe.Subscription> {
    const user = await this.usersService.findOne(userId);
    
    // Get or create customer
    let customer: Stripe.Customer;
    const existingCustomers = await this.stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await this.createCustomer(userId, user.email);
    }

    // Attach payment method to customer
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await this.stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Get price ID for the plan
    const priceId = this.getPriceIdForPlan(plan);

    // Create subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user role to subscriber
    await this.usersService.changeRole(userId, UserRole.SUBSCRIBER);

    return subscription;
  }

  async cancelSubscription(userId: string): Promise<Stripe.Subscription> {
    const user = await this.usersService.findOne(userId);
    
    const customer = await this.getCustomerByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const subscriptions = await this.stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new NotFoundException('No active subscription found');
    }

    const subscription = await this.stripe.subscriptions.update(
      subscriptions.data[0].id,
      { cancel_at_period_end: true }
    );

    return subscription;
  }

  async pauseSubscription(userId: string): Promise<Stripe.Subscription> {
    const user = await this.usersService.findOne(userId);
    
    const customer = await this.getCustomerByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const subscriptions = await this.stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new NotFoundException('No active subscription found');
    }

    const subscription = await this.stripe.subscriptions.update(
      subscriptions.data[0].id,
      { pause_collection: { behavior: 'void' } }
    );

    return subscription;
  }

  async resumeSubscription(userId: string): Promise<Stripe.Subscription> {
    const user = await this.usersService.findOne(userId);
    
    const customer = await this.getCustomerByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const subscriptions = await this.stripe.subscriptions.list({
      customer: customer.id,
      status: 'paused',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new NotFoundException('No paused subscription found');
    }

    const subscription = await this.stripe.subscriptions.update(
      subscriptions.data[0].id,
      { pause_collection: null }
    );

    return subscription;
  }

  async getSubscriptionStatus(userId: string): Promise<any> {
    const user = await this.usersService.findOne(userId);
    
    const customer = await this.getCustomerByUserId(userId);
    if (!customer) {
      return { status: 'no_subscription' };
    }

    const subscriptions = await this.stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return { status: 'no_subscription' };
    }

    const subscription = subscriptions.data[0];
    return {
      status: subscription.status,
      plan: this.getPlanFromPriceId(subscription.items.data[0].price.id),
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  }

  async createPaymentIntent(amount: number, currency: string = 'eur'): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  private async getCustomerByUserId(userId: string): Promise<Stripe.Customer | null> {
    const customers = await this.stripe.customers.list({
      limit: 100,
    });

    return customers.data.find(customer => customer.metadata.userId === userId) || null;
  }

  private getPriceIdForPlan(plan: SubscriptionPlan): string {
    switch (plan) {
      case SubscriptionPlan.BASIC:
        return this.configService.get('STRIPE_BASIC_PRICE_ID');
      case SubscriptionPlan.STANDARD:
        return this.configService.get('STRIPE_STANDARD_PRICE_ID');
      case SubscriptionPlan.PREMIUM:
        return this.configService.get('STRIPE_PREMIUM_PRICE_ID');
      default:
        throw new BadRequestException('Invalid plan');
    }
  }

  private getPlanFromPriceId(priceId: string): SubscriptionPlan {
    const basicPriceId = this.configService.get('STRIPE_BASIC_PRICE_ID');
    const standardPriceId = this.configService.get('STRIPE_STANDARD_PRICE_ID');
    const premiumPriceId = this.configService.get('STRIPE_PREMIUM_PRICE_ID');

    if (priceId === basicPriceId) return SubscriptionPlan.BASIC;
    if (priceId === standardPriceId) return SubscriptionPlan.STANDARD;
    if (priceId === premiumPriceId) return SubscriptionPlan.PREMIUM;
    
    throw new BadRequestException('Unknown price ID');
  }
}
