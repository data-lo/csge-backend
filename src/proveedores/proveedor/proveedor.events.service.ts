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
    // 3. El usuario desactivó al proveedor.
    @OnEvent('disabled-provider', { async: false })
    async disabledProvider(payload: { providerId: string }) {
        this.logger.log(`🔄 Iniciando evento "disabled-provider" para el Proveedor: ${payload.providerId}`);
        
        try {
            await this.providerService.desactivateProvider(payload.providerId);
            this.logger.log(`✅ Evento "disabled-provider" completado. Proveedor ${payload.providerId} desactivado.`);
        } catch (error) {
            this.logger.error(`❌ Error en el evento "disabled-provider" para el Proveedor ${payload.providerId}: ${error.message}`, error.stack);
        }
    }

    // 📌 Este evento activa a un proveedor bajo las siguientes condiciones:
    // 1. Hay un nuevo contrato vigente.
    // 2. El usuario activó el proveedor.
    @OnEvent('enabled-provider', { async: true })
    async enabledProvider(payload: { providerId: string }) {
        this.logger.log(`🔄 Iniciando evento "enabled-provider" para el Proveedor: ${payload.providerId}`);
        
        try {
            await this.providerService.activateProvider(payload.providerId);
            this.logger.log(`✅ Evento "enabled-provider" completado. Proveedor ${payload.providerId} activado.`);
        } catch (error) {
            this.logger.error(`❌ Error en el evento "enabled-provider" para el Proveedor ${payload.providerId}: ${error.message}`, error.stack);
        }
    }
}
