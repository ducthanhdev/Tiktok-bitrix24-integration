import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from './deal.entity';

@Injectable()
export class DealsService {
  constructor(@InjectRepository(Deal) private readonly dealRepo: Repository<Deal>) {}

  async list(params: { status?: string; assigned_to?: string; pipeline_id?: string }) {
    const where: any = {};
    if (params.status) where.stage = params.status;
    if (params.assigned_to) where.assigned_to = params.assigned_to;
    if (params.pipeline_id) where.pipeline_id = params.pipeline_id;
    return this.dealRepo.find({ where, order: { created_at: 'DESC' } });
  }
}


