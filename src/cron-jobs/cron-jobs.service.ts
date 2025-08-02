import { Injectable} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CampañasService } from 'src/campañas/campañas/campañas.service';
import { ContratosService } from 'src/contratos/contratos/contratos.service';

@Injectable()
export class CronJobsService {

  constructor(
    private readonly contractsService: ContratosService,

    private readonly campaignService: CampañasService

  ) { }

  // 🕖 Cron job: Ejecuta esta tarea automáticamente todos los días a las 7:00 AM
  // Expresión cron: '0 7 * * *' → Minuto 0, Hora 7, cualquier día del mes, cualquier mes, cualquier día de la semana
  // Nota: La hora depende del huso horario del servidor (o del valor 'timeZone' si se especifica)
  @Cron('0 7 * * *')
  async Contracts() {
    await this.contractsService.checkContractsExpiration();
    await this.contractsService.disableProvidersWithoutActiveContracts();
  }

  // 🕖 Cron job: Ejecuta esta tarea automáticamente todos los días a las 7:00 AM
  // Expresión cron: '0 7 * * *' → Minuto 0, Hora 7, cualquier día del mes, cualquier mes, cualquier día de la semana
  // Nota: La hora depende del huso horario del servidor (o del valor 'timeZone' si se especifica)
  // Tarea deshabilitada: el usuario la realizará manualmente
  // @Cron('0 7 * * *')
  // async Campaigns() {
  //   await this.campaignService.checkCampaignsExpiration();
  // }
}
