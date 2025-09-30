# TikTok-Bitrix24 Integration API

> **Modern NestJS application for automated lead generation and CRM integration**

[![NestJS](https://img.shields.io/badge/NestJS-11.0-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://docker.com/)

## 🚀 Overview

Automated lead collection from TikTok campaigns with intelligent Bitrix24 CRM integration, featuring real-time analytics, background processing, and comprehensive reporting.

### ✨ Key Features

- **TikTok Lead Collection**: Secure webhook processing with signature verification
- **Bitrix24 CRM Integration**: Automated lead/deal creation with field mapping
- **Smart Analytics**: Conversion tracking, campaign performance, ROI metrics
- **Background Processing**: Redis + BullMQ for async operations
- **Real-time Notifications**: Slack/Email alerts for key events
- **Data Export**: CSV/Excel reports with date filtering
- **Production Ready**: Docker, health checks, rate limiting, logging

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TikTok Ads    │───▶│   Webhook API   │───▶│   PostgreSQL    │
│   Campaigns     │    │   (NestJS)      │    │   Database     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Bitrix24 CRM │    │   Redis Queue   │
                       │   Integration  │    │   Background    │
                       └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

- **Framework**: NestJS 11 + TypeScript 5.7
- **Database**: PostgreSQL 16 + TypeORM
- **Queue**: Redis + BullMQ
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker + Docker Compose
- **Monitoring**: Winston logging + Health checks

## 📋 Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd tiktok-bitrix24-integration
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=tiktok_bitrix

# TikTok Webhook
TIKTOK_WEBHOOK_SECRET=your_secret_key

# Bitrix24 CRM
B24_BASE_URL=https://your-portal.bitrix24.com/rest/1/
B24_TOKEN=your_access_token

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Notifications (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 3. Docker Setup (Recommended)

```bash
# Start all services
docker compose up -d --build

# Run database migrations
docker compose exec app npm run db:migrate

# Seed initial data
docker compose exec app npm run db:seed
```

### 4. Manual Setup

```bash
# Start PostgreSQL & Redis
# Then run migrations
npm run db:migrate
npm run db:seed

# Start development server
npm run start:dev
```

## 📚 API Documentation

### Base URLs
- **API**: `http://localhost:3000/api/v1`
- **Webhooks**: `http://localhost:3000/webhooks`
- **Swagger UI**: `http://localhost:3000/docs`

### Core Endpoints

#### 🎯 Lead Management
```bash
GET    /api/v1/leads                    # List leads with pagination
GET    /api/v1/leads/:id               # Get lead details
POST   /api/v1/leads/:id/convert-to-deal # Convert lead to deal
```

#### 💼 Deal Management
```bash
GET    /api/v1/deals                    # List deals with filters
```

#### ⚙️ Configuration
```bash
GET    /api/v1/config/mappings         # Get field mappings
PUT    /api/v1/config/mappings         # Update field mappings
GET    /api/v1/config/rules            # Get deal rules
PUT    /api/v1/config/rules            # Update deal rules
```

#### 📊 Analytics & Reports
```bash
GET    /api/v1/analytics/conversion-rates      # Conversion metrics
GET    /api/v1/analytics/campaign-performance  # Campaign stats
GET    /api/v1/analytics/reports/export        # CSV export
GET    /api/v1/analytics/reports/export.xlsx   # Excel export
```

#### 🔗 Webhooks
```bash
POST   /webhooks/tiktok/leads          # TikTok lead webhook
POST   /webhooks/bitrix24/deals        # Bitrix24 deal webhook
```

## 🧪 Testing

### Run Complete Test Suite
```bash
# Test all APIs and webhooks
npm run test:complete

# Individual test commands
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage report
```

### Manual Testing
```bash
# Health check
curl http://localhost:3000/api/v1/health

# List leads
curl http://localhost:3000/api/v1/leads

# Test TikTok webhook (with signature)
curl -X POST http://localhost:3000/webhooks/tiktok/leads \
  -H "Content-Type: application/json" \
  -H "tiktok-signature: <generated_signature>" \
  -d '{"event_id":"test_123","event":"lead.generate","timestamp":1709876543,"advertiser_id":"123","data":{"external_id":"test_lead","name":"John Doe","email":"john@example.com","phone":"+84901234567"}}'
```

## 🗄️ Database Schema

### Core Tables

#### `leads` - Lead Management
```sql
- id (UUID, Primary Key)
- external_id (VARCHAR, Unique)
- source (VARCHAR, Default: 'tiktok')
- name, email, phone (VARCHAR)
- campaign_id, ad_id, form_id (VARCHAR)
- raw_data (JSONB)
- bitrix24_id (INTEGER)
- status (VARCHAR, Default: 'new')
- score (INTEGER, Default: 0)
- created_at, updated_at (TIMESTAMPTZ)
```

#### `deals` - Deal Management
```sql
- id (UUID, Primary Key)
- lead_id (UUID, Foreign Key)
- bitrix24_id (INTEGER)
- title (VARCHAR)
- amount (NUMERIC)
- currency (VARCHAR, Default: 'VND')
- stage, probability (VARCHAR, INTEGER)
- assigned_to, pipeline_id (VARCHAR)
- created_at, updated_at (TIMESTAMPTZ)
```

#### `configurations` - Dynamic Settings
```sql
- id (SERIAL, Primary Key)
- key (VARCHAR, Unique)
- value (JSONB)
- updated_at (TIMESTAMPTZ)
```

## 🔧 Configuration

### Field Mapping
Configure how TikTok fields map to Bitrix24 fields:

```json
{
  "name": "NAME",
  "email": "EMAIL[0][VALUE]",
  "phone": "PHONE[0][VALUE]",
  "company": "COMPANY",
  "source": "SOURCE",
  "campaign_id": "UF_CRM_CAMPAIGN_ID"
}
```

### Deal Rules
Configure automatic deal creation rules:

```json
{
  "default_stage": "NEW",
  "default_probability": 10,
  "default_pipeline_id": 1,
  "auto_assign": true,
  "rules": [
    {
      "condition": "score >= 80",
      "stage": "QUALIFICATION",
      "probability": 50,
      "assigned_to": 1
    }
  ]
}
```

## 🚀 Deployment

### Production Docker Setup

```bash
# Build production image
docker build -t tiktok-bitrix24-api .

# Run with production config
docker run -d \
  --name tiktok-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e B24_BASE_URL=your-bitrix24-url \
  tiktok-bitrix24-api
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=tiktok_bitrix

# Security
TIKTOK_WEBHOOK_SECRET=your-secure-secret

# Bitrix24
B24_BASE_URL=https://your-portal.bitrix24.com/rest/1/
B24_TOKEN=your-access-token

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## 📊 Monitoring & Logs

### Health Checks
- **Endpoint**: `GET /api/v1/health`
- **Database**: PostgreSQL connection status
- **Redis**: Queue system status

### Logging
- **Format**: JSON structured logs
- **Levels**: error, warn, info, debug
- **Transport**: Console (configurable for file/remote)

### Metrics
- Request/response times
- Error rates
- Queue processing times
- Database query performance

## 🔒 Security

- **Webhook Verification**: HMAC-SHA256 signature validation
- **Rate Limiting**: 120 requests/minute per IP
- **Input Validation**: DTO validation with class-validator
- **SQL Injection**: TypeORM parameterized queries
- **CORS**: Configurable cross-origin policies

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Swagger UI](http://localhost:3000/docs)
- **Issues**: GitHub Issues
- **Email**: support@example.com

---

**Built with ❤️ using NestJS, TypeScript, and modern web technologies**