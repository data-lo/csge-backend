import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EstacionService } from './estacion.service';

@Injectable()
export class StationEventsService {
    private readonly logger = new Logger(StationEventsService.name);
    constructor(private stationService: EstacionService) { }
    @OnEvent('disable-stations', { async: true })
    async disableStations(payload: { providerId: string, typeServices: string[] }) {
        try {
            this.logger.log(`🔄 Iniciando evento "disabled-stations" para el Proveedor: ${payload.providerId}`);
            await this.stationService.getStationsByServiceType(payload.providerId, payload.typeServices);
            this.logger.log(`✅ Evento "disabled-station" completado. Estaciones del Proveedor: ${payload.providerId} desactivadas.`);
        } catch (error) {
            this.logger.error(`❌ Error al procesar el evento "disabled-stations": ${error.message}`, error.stack);
        }
    }


    @OnEvent('enable-stations', { async: true })
    async enableStations(payload: { providerId: string, typeServices: string[] }) {
        try {
            this.logger.log(`🔄 Iniciando evento "disabled-stations" para el Proveedor: ${payload.providerId}`);
            await this.stationService.getStationsByServiceType(payload.providerId, payload.typeServices);
            this.logger.log(`✅ Evento "disabled-station" completado. Estaciones del Proveedor: ${payload.providerId} desactivadas.`);
        } catch (error) {
            this.logger.error(`❌ Error al procesar el evento "disabled-stations": ${error.message}`, error.stack);
        }
    }
}
