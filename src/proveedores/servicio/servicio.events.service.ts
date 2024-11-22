import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ProveedorEvent } from "../proveedor/interfaces/proveedor-evento";
import { ServicioService } from "./servicio.service";
import { ContratoEvent } from "src/contratos/interfaces/contrato-evento";

@Injectable()
export class EstacionEventosService {
    constructor(
        private servicioService: ServicioService,
    ) { }

    @OnEvent('proveedor.desactivado', { async: true })
    async desactivarServicio(event: ProveedorEvent) {
        const estaciones = event.payload.estaciones;
        for (const estacion of estaciones) {
            const servicios = estacion.servicios;
            for (const servicio of servicios) {
                const servicioId = servicio.id
                await this.servicioService.desactivarServicio(servicioId);
            }
        }
        return;
    }

    @OnEvent('contrato.desactivado', { async: true })
    async desactivarServicioPorTipo(event: ContratoEvent) {
        const estaciones = event.payload.proveedor.estaciones;
        const tipoServicio = event.payload.tipoDeServicio;
        for (const estacion of estaciones) {
            const servicios = estacion.servicios.filter((servicio) => {
                if (servicio.tipoDeServicio === tipoServicio) {
                    return servicio;
                }
            });
            for (const servicio of servicios) {
                await this.servicioService.desactivarServicio(servicio.id);
            }
        }
        return;
    }

    @OnEvent('contrato.liberado', { async: true })
    async activarServicioPorTipo(event: ContratoEvent) {
        const estaciones = event.payload.proveedor.estaciones;
        const tipoServicio = event.payload.tipoDeServicio;
        for (const estacion of estaciones) {
            const servicios = estacion.servicios.filter((servicio) => {
                if (servicio.tipoDeServicio === tipoServicio) {
                    return servicio;
                }
            });
            for (const servicio of servicios) {
                await this.servicioService.activarServicio(servicio.id);
            }
        }
        return;
    }

}