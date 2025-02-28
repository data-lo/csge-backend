import { Module } from '@nestjs/common';
import { CronJobsService } from './cron-jobs.service';
import { ContratosModule } from 'src/contratos/contratos/contratos.module';

@Module({
  imports: [ContratosModule],
  controllers: [],
  providers: [CronJobsService],
})
export class CronJobsModule {}
