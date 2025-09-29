import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CampaignDto {
  @IsOptional()
  @IsString()
  campaign_id?: string;

  @IsOptional()
  @IsString()
  campaign_name?: string;

  @IsOptional()
  @IsString()
  ad_id?: string;

  @IsOptional()
  @IsString()
  ad_name?: string;
}

export class FormDto {
  @IsOptional()
  @IsString()
  form_id?: string;

  @IsOptional()
  @IsString()
  form_name?: string;
}

export class LeadDataDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  ttclid?: string;
}

export class CustomQuestionDto {
  @IsString()
  question!: string;
  @IsString()
  answer!: string;
}

export class TiktokWebhookDto {
  @IsString()
  @IsIn(['lead.generate', 'form.completed', 'user.interaction'])
  event!: string;

  @IsString()
  @IsNotEmpty()
  event_id!: string;

  @IsNumber()
  timestamp!: number;

  @IsString()
  advertiser_id!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignDto)
  campaign?: CampaignDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormDto)
  form?: FormDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LeadDataDto)
  lead_data?: LeadDataDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomQuestionDto)
  custom_questions?: CustomQuestionDto[];

  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;
}


