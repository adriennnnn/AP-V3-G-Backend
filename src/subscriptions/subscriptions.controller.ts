import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Query, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SubscriptionStatus, SubscriptionType } from './entities/subscription.entity';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UsePipes(new ValidationPipe())
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(
    @Query('status') status?: SubscriptionStatus,
    @Query('type') type?: SubscriptionType,
    @Query('userId') userId?: string
  ) {
    if (status) {
      return this.subscriptionsService.findByStatus(status);
    }
    if (type) {
      return this.subscriptionsService.findByType(type);
    }
    if (userId) {
      return this.subscriptionsService.findByUser(userId);
    }
    return this.subscriptionsService.findAll();
  }

  @Get('my-subscriptions')
  @Roles(UserRole.USER, UserRole.AUTHOR, UserRole.MANAGER, UserRole.ADMIN)
  findMySubscriptions(@Req() req) {
    return this.subscriptionsService.findByUser(req.user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id);
  }

  @Patch(':id/renew')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  renew(@Param('id') id: string) {
    return this.subscriptionsService.renew(id);
  }

  @Get('check-expired')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  checkExpiredSubscriptions() {
    return this.subscriptionsService.checkExpiredSubscriptions();
  }
}
