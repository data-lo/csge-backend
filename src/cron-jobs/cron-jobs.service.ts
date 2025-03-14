import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContratosService } from 'src/contratos/contratos/contratos.service';

@Injectable()
export class CronJobsService {

  constructor(
    private readonly contractsService: ContratosService,

  ) { }

  @Cron('45 * * * * *')
  async Contracts() {
    await this.contractsService.checkContractExpiration();
    await this.contractsService.disableProvidersWithoutActiveContracts();
  }

  @Cron('0 8 * * *') // Se ejecuta a las 8:00 AM Todos los Días
  handleCron() {
    console.log('Ejecutando cron job a las 11:00 PM UTC...');
  }

}
