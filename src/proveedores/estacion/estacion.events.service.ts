import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EstacionService } from './estacion.service';
import { TYPE_EVENT_STATION } from './enums/type-event-station';

@Injectable()
export class StationEventsService {
    private readonly logger = new Logger(StationEventsService.name);
    constructor(private stationService: EstacionService) { }
    @OnEvent('disable-stations', { async: true })
    async disableStations(payload: { providerId: string, typeServices: string[] }) {
        try {
            this.logger.log(`🔄 Iniciando evento "disable-stations" para el Proveedor: ${payload.providerId}`);
            await this.stationService.getStationsByServiceType(payload.providerId, payload.typeServices, TYPE_EVENT_STATION.DISABLE_STATION);
            this.logger.log(`✅ Evento "disable-stations" completado para el Proveedor: ${payload.providerId}`);
        } catch (error) {
            this.logger.error(`❌ Error al procesar el evento "disable-stations": ${error.message}`, error.stack);
        }
    }


    @OnEvent('enable-stations', { async: true })
    async enableStations(payload: { providerId: string, typeServices: string[] }) {
        try {
            this.logger.log(`🔄 Iniciando evento "enable-stations" para el Proveedor: ${payload.providerId}`);
            await this.stationService.getStationsByServiceType(payload.providerId, payload.typeServices, TYPE_EVENT_STATION.ACTIVATE_STATION);
            this.logger.log(`✅ Evento "enable-stations" completado para el Proveedor: ${payload.providerId}`);
        } catch (error) {
            this.logger.error(`❌ Error al procesar el evento "enable-stations": ${error.message}`, error.stack);
        }
    }
}
