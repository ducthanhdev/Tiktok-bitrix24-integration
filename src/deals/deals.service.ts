import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from './deal.entity';

@Injectable()
export class DealsService {
  constructor(@InjectRepository(Deal) private readonly dealRepo: Repository<Deal>) {}

  async list(params: { status?: string }) {
    const where = params.status ? { stage: params.status } : {};
    return this.dealRepo.find({ where, order: { created_at: 'DESC' } });
  }
}


