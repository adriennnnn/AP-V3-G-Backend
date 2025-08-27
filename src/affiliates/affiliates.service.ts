import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Affiliate, AffiliateStatus } from './entities/affiliate.entity';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';

@Injectable()
export class AffiliatesService {
  constructor(
    @InjectRepository(Affiliate)
    private affiliatesRepository: Repository<Affiliate>,
  ) {}

  async create(createAffiliateDto: CreateAffiliateDto): Promise<Affiliate> {
    const existingAffiliate = await this.affiliatesRepository.findOne({
      where: { email: createAffiliateDto.email }
    });
    
    if (existingAffiliate) {
      throw new BadRequestException('Affiliate with this email already exists');
    }

    const newAffiliate = this.affiliatesRepository.create(createAffiliateDto);
    return this.affiliatesRepository.save(newAffiliate);
  }

  async findAll(): Promise<Affiliate[]> {
    return this.affiliatesRepository.find({
      relations: ['assignedManager']
    });
  }

  async findOne(id: string): Promise<Affiliate> {
    const affiliate = await this.affiliatesRepository.findOne({
      where: { id },
      relations: ['assignedManager']
    });
    
    if (!affiliate) {
      throw new NotFoundException(`Affiliate with ID ${id} not found`);
    }
    
    return affiliate;
  }

  async findByStatus(status: AffiliateStatus): Promise<Affiliate[]> {
    return this.affiliatesRepository.find({
      where: { status },
      relations: ['assignedManager']
    });
  }

  async update(id: string, updateAffiliateDto: UpdateAffiliateDto): Promise<Affiliate> {
    const affiliate = await this.findOne(id);
    
    if (updateAffiliateDto.email && updateAffiliateDto.email !== affiliate.email) {
      const existingAffiliate = await this.affiliatesRepository.findOne({
        where: { email: updateAffiliateDto.email }
      });
      
      if (existingAffiliate) {
        throw new BadRequestException('Affiliate with this email already exists');
      }
    }

    Object.assign(affiliate, updateAffiliateDto);
    return this.affiliatesRepository.save(affiliate);
  }

  async remove(id: string): Promise<void> {
    const result = await this.affiliatesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Affiliate with ID ${id} not found`);
    }
  }

  async updateEarnings(id: string, amount: number): Promise<Affiliate> {
    const affiliate = await this.findOne(id);
    affiliate.totalEarnings += amount;
    return this.affiliatesRepository.save(affiliate);
  }

  async assignManager(id: string, managerId: string): Promise<Affiliate> {
    const affiliate = await this.findOne(id);
    // Note: You would need to inject UsersService to validate the manager
    // For now, we'll just store the managerId as a string
    affiliate.assignedManager = { id: managerId } as any;
    return this.affiliatesRepository.save(affiliate);
  }
}
