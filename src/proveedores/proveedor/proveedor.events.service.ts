import { Injectable, Logger } from "@nestjs/common";
import { ProveedorService } from "./proveedor.service";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class ProviderEventService {
    private readonly logger = new Logger(ProviderEventService.name);

    constructor(private readonly providerService: ProveedorService) {}

    // 📌 Este evento desactiva a un proveedor bajo las siguientes condiciones:
    // 1. El contrato ha vencido.
    // 2. Un contrato ha sido cancelado.
    @OnEvent('disable-provider', { async: false })
    async disableProvider(payload: { providerId: string }) {        
        try {
            this.logger.log(`🔄 Iniciando evento "disable-provider" para el Proveedor: ${payload.providerId}`);
            await this.providerService.desactivateProvider(payload.providerId);
            this.logger.log(`✅ Evento "disable-provider" completado. Proveedor ${payload.providerId} desactivado.`);
        } catch (error) {
            this.logger.error(`❌ Error en el evento "disable-provider" para el Proveedor ${payload.providerId}: ${error.message}`, error.stack);
        }
    }

    // 📌 Este evento activa a un proveedor bajo las siguientes condiciones:
    // 1. El usuario crea un nuevo contrato.
    @OnEvent('enable-provider', { async: true })
    async enableProvider(payload: { providerId: string }) {        
        try {
            this.logger.log(`🔄 Iniciando evento "enabled-provider" para el Proveedor: ${payload.providerId}`);
            await this.providerService.activateProvider(payload.providerId);
            this.logger.log(`✅ Evento "enabled-provider" completado. Proveedor ${payload.providerId} activado.`);
        } catch (error) {
            this.logger.error(`❌ Error en el evento "enabled-provider" para el Proveedor ${payload.providerId}: ${error.message}`, error.stack);
        }
    }
}
