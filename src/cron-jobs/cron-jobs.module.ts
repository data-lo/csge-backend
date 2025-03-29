import { Module } from '@nestjs/common';
import { CronJobsService } from './cron-jobs.service';
import { ContratosModule } from 'src/contratos/contratos/contratos.module';
import { CampañasModule } from 'src/campañas/campañas/campañas.module';

@Module({
  imports: [ContratosModule, CampañasModule],
  controllers: [],
  providers: [CronJobsService],
})
export class CronJobsModule {}
