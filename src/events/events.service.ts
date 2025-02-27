import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { ContratoMaestro } from 'src/contratos/contratos/entities/contrato.maestro.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { Servicio } from 'src/proveedores/servicio/entities/servicio.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(ContratoMaestro)
        private readonly masterContractRepository: Repository<ContratoMaestro>,

        @InjectRepository(Proveedor)
        private readonly providerRepository: Repository<Proveedor>,

        @InjectRepository(Servicio)
        private serviceRepository: Repository<Servicio>,
    ) { }

    @OnEvent('activate.services')
    async handleOrderCreatedEvent(payload: { masterContractId: string; providerId: string }) {

        const contract = await this.masterContractRepository.findOne({
            where: { id: payload.masterContractId },
            relations: ['contratos'],
        });

        const availableServices = contract.contratos.map((contrato) => contrato.tipoDeServicio);

        const provider = await this.providerRepository.findOne({
            where: { id: payload.providerId },
            relations: {
                estaciones: {
                    servicios: true,
                },
            },
        });

        if (!provider) {
            console.log(`No se ejecutó el evento. El proveedor con ID ${payload.providerId} no se encontró en la base de datos.`);
            return;
        }
        
        if (provider.estaciones.length === 0) {
            console.log(`No se ejecutó el evento. El proveedor con ID ${payload.providerId} no tiene estaciones asociadas, por lo que no se puede procesar.`);
            return;
        }        
        
        for (const station of provider.estaciones) {
            for (const service of station.servicios) {
                if (availableServices.includes(service.tipoDeServicio) && service.estatus === false) {
                    await this.serviceRepository.save({
                        ...service,
                        estatus: true
                    });
                    console.log(service.nombreDeServicio);
                }
            }
        }
    }
}
