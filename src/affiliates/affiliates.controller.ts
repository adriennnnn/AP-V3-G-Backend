import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Query } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AffiliateStatus } from './entities/affiliate.entity';

@Controller('affiliates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  @UsePipes(new ValidationPipe())
  create(@Body() createAffiliateDto: CreateAffiliateDto) {
    return this.affiliatesService.create(createAffiliateDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  findAll(@Query('status') status?: AffiliateStatus) {
    if (status) {
      return this.affiliatesService.findByStatus(status);
    }
    return this.affiliatesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  findOne(@Param('id') id: string) {
    return this.affiliatesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(@Param('id') id: string, @Body() updateAffiliateDto: UpdateAffiliateDto) {
    return this.affiliatesService.update(id, updateAffiliateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.affiliatesService.remove(id);
  }

  @Patch(':id/assign-manager')
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  assignManager(@Param('id') id: string, @Body('managerId') managerId: string) {
    return this.affiliatesService.assignManager(id, managerId);
  }

  @Patch(':id/update-earnings')
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  updateEarnings(@Param('id') id: string, @Body('amount') amount: number) {
    return this.affiliatesService.updateEarnings(id, amount);
  }
}
