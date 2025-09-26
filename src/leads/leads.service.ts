import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { Deal } from '../deals/deal.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Deal) private readonly dealRepo?: Repository<Deal>,
  ) {}

  async list(params: { page: number; limit: number; source?: string }) {
    const { page, limit, source } = params;
    const [items, total] = await this.leadRepo.findAndCount({
      where: source ? { source } : {},
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async getById(id: string) {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async convertToDeal(id: string) {
    const lead = await this.getById(id);
    if (!this.dealRepo) throw new Error('Deal repository not available');
    const deal = this.dealRepo.create({
      lead,
      title: `Deal for ${lead.name}`,
      stage: 'NEW',
      probability: 30,
    });
    const saved = await this.dealRepo.save(deal);
    return saved;
  }
}
