import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Firma } from 'src/firma/firma/entities/firma.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Firma])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
