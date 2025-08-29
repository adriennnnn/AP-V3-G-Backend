import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UsePipes(new ValidationPipe())
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('register-with-referral')
  @UsePipes(new ValidationPipe())
  createWithReferral(@Body() createUserDto: CreateUserDto, @Body('referralCode') referralCode?: string) {
    return this.usersService.createWithReferral(createUserDto, referralCode);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  findAll(@Query('role') role?: UserRole) {
    if (role) {
      return this.usersService.findByRole(role);
    }
    return this.usersService.findAll();
  }

  @Get('profile')
  @Roles(UserRole.USER, UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  getProfile(@Req() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get('affiliate/dashboard')
  @Roles(UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  async getAffiliateDashboard(@Req() req) {
    const user = await this.usersService.findOne(req.user.id);
    const directReferrals = await this.usersService.getDirectReferrals(req.user.id);
    const indirectReferrals = await this.usersService.getIndirectReferrals(req.user.id);
    
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        totalEarnings: user.totalEarnings,
        pendingEarnings: user.pendingEarnings,
        directReferrals: user.directReferrals,
        indirectReferrals: user.indirectReferrals
      },
      directReferrals: directReferrals.map(ref => ({
        id: ref.id,
        username: ref.username,
        email: ref.email,
        createdAt: ref.createdAt
      })),
      indirectReferrals: indirectReferrals.map(ref => ({
        id: ref.id,
        username: ref.username,
        email: ref.email,
        createdAt: ref.createdAt
      })),
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`
    };
  }

  @Get('referral-link')
  @Roles(UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  async getReferralLink(@Req() req) {
    const user = await this.usersService.findOne(req.user.id);
    return {
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('profile')
  @Roles(UserRole.USER, UserRole.SUBSCRIBER, UserRole.AUTHOR, UserRole.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/change-role')
  @Roles(UserRole.ADMIN)
  changeRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.changeRole(id, role);
  }
}