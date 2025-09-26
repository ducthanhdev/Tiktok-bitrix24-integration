import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigurationEntity } from './configuration.entity';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(ConfigurationEntity)
    private readonly configRepo: Repository<ConfigurationEntity>,
  ) {}

  async get<T = unknown>(key: string): Promise<T> {
    const row = await this.configRepo.findOne({ where: { key } });
    if (!row) throw new NotFoundException('Config not found');
    return row.value as T;
  }

  async set(key: string, value: unknown): Promise<void> {
    const existing = await this.configRepo.findOne({ where: { key } });
    if (existing) {
      existing.value = value;
      await this.configRepo.save(existing);
    } else {
      const created = this.configRepo.create({ key, value });
      await this.configRepo.save(created);
    }
  }
}


