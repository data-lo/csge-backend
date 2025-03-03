import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContratosService } from 'src/contratos/contratos/contratos.service';

@Injectable()
export class CronJobsService {

     constructor(
        private readonly contractsService: ContratosService,

      ) { }
    
    @Cron('45 * * * * *')
    async handleCron() {
        await this.contractsService.checkContractExpiration();
        await this.contractsService.disableProvidersWithoutActiveContracts();
    }
}
