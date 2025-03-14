import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ServicioService } from "./servicio.service";

@Injectable()
export class ServiceEventsService {
    constructor(
        private serviceHandler: ServicioService,
    ) { }

    private readonly logger = new Logger(ServiceEventsService.name);

    @OnEvent('disable-multiple-services', { async: true })
    async disableMultipleServices(payload: { typeServicesId: string[] }) {
        try {
            this.logger.log(`🔄 Iniciando evento "disable-multiple-services"`);
            await this.serviceHandler.disableMultiplyServices(payload.typeServicesId);
            this.logger.log(`✅ Evento "disable-multiple-services" completado. Servicios desactivados.`);
        } catch (error) {
            this.logger.error(`❌ Error al procesar el evento "disable-multiple-services": ${error.message}`, error.stack);
        }
    }

    @OnEvent('enable-multiple-services', { async: true })
    async enableMultipleServices(payload: { typeServicesId: string[] }) {
        try {
            this.logger.log(`🔄 Iniciando evento "enable-multiple-services"`);
            await this.serviceHandler.enableMultiplyServices(payload.typeServicesId);
            this.logger.log(`✅ Evento "enable-multiple-services" completado. Servicios activados.`);
        } catch (error) {
            this.logger.error(`❌ Error al procesar el evento "enable-multiple-services": ${error.message}`, error.stack);
        }
    }
}