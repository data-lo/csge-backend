import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstacionDto } from './dto/create-estacion.dto';
import { UpdateEstacionDto } from './dto/update-estacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Estacion } from './entities/estacion.entity';
import { Repository } from 'typeorm';
import { MunicipioService } from '../municipio/municipio.service';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContratosService } from 'src/contratos/contratos/contratos.service';
import { TYPE_EVENT_STATION } from './enums/type-event-station';

@Injectable()
export class EstacionService {

  constructor(
    @InjectRepository(Estacion)
    private stationRepository: Repository<Estacion>,

    @InjectRepository(Proveedor)
    private providerRepository: Repository<Proveedor>,

    private readonly municipioService: MunicipioService,

    private eventEmitter: EventEmitter2,

    private readonly contractService: ContratosService

  ) { }

  async create(createStationDto: CreateEstacionDto) {
    try {
      const { municipiosIds, proveedorId, estatus, ...rest } = createStationDto;

      const municipalities = await Promise.all(
        municipiosIds.map(municipality => this.municipioService.findOne(municipality))
      );

      const provider = await this.providerRepository.findOneBy({ id: proveedorId });

      if (!provider) {
        throw new NotFoundException('¡El proveedor !');
      }

      const activeContracts = await this.contractService.countActiveContracts(provider.id);

      const status = activeContracts > 0;

      const station = this.stationRepository.create({
        municipios: municipalities,
        proveedor: provider,
        estatus: status,
        ...rest
      });

      await this.stationRepository.save(station);

      return station;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAllBusqueda() {
    try {
      const estaciones = await this.stationRepository.find({
        relations: {
          municipios: true,
        }
      });
      return estaciones;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter;
      const estaciones = await this.stationRepository.find({
        take: paginationSetter.castPaginationLimit(),
        skip: paginationSetter.getSkipElements(pagina),
        relations: {
          municipios: true,
        }
      });
      return estaciones;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAllByServicio(servicio: string) {
    try {
      const estaciones = await this.stationRepository.find({
        relations: {
          municipios: true,
          servicios: true,
        }
      });
      const estacionesFiltradas = estaciones.filter(estacion =>
        estacion.servicios.some(s => s.tipoDeServicio === servicio)
      );
      return estacionesFiltradas;
    } catch (error) {
      handleExceptions(error);
    }

  }

  async findOne(id: string) {
    try {
      const estacion = await this.stationRepository.findOne({
        where: { id: id },
        relations: {
          municipios: true,
          contactos: true,
          servicios: {
            renovaciones: true
          }
        }
      });
      
      estacion.servicios.forEach(servicio => {
        const ultimaRenovacion = servicio.renovaciones.filter(renovacion => {
          if (renovacion.esUltimaRenovacion) {
            return renovacion;
          }
        });

        if (!ultimaRenovacion[0]) throw new NotFoundException('No se encuentra la renovacion');

        delete ultimaRenovacion[0].fechaDeCreacion;
        delete servicio.renovaciones;
        servicio.renovaciones = ultimaRenovacion;
      });
      if (!estacion) throw new BadRequestException('La estacion no se encuentra');


      return estacion;
    } catch (error) {
      handleExceptions(error);
    }
  }


  async getStation(stationId: string) {
    try {
      const station = await this.stationRepository.findOne({
        where: { id: stationId }
      });

      if(!station){
        throw new NotFoundException('¡No se encontró ninguna estación con el ID especificado!');
      }

      return station;

    } catch (error) {
      handleExceptions(error);
    }
  }



  async update(stationId: string, updateEstacionDto: UpdateEstacionDto) {
    try {

      const { municipiosIds, ...rest } = updateEstacionDto;
      const station = await this.stationRepository.findOne({
        where: { id: stationId },
        relations: {
          municipios: true
        }
      });

      if (!station) {
        throw new NotFoundException(`¡La estación con ID ${stationId} no fue encontrada!`);
      }

      Object.assign(station, rest);
      if (municipiosIds && municipiosIds.length > 0) {

        const municipios = await Promise.all(
          municipiosIds.map(municipioId =>
            this.municipioService.findOne(municipioId)
          )
        );

        station.municipios = municipios;
      }

      if (municipiosIds && municipiosIds.length === 0) {
        station.municipios = [];
      };

      await this.stationRepository.save(station);
      return await this.findOne(stationId);

    } catch (error) {
      handleExceptions(error);
    }
  }

  async disableStation(stationId: string) {
    try {
      const station = await this.findOne(stationId);

      if (!station) {
        throw new NotFoundException(`¡La estación con ID ${stationId} no fue encontrada!`);
      }

      await this.stationRepository.update(stationId, { estatus: false });

      return await this.findOne(stationId);
    } catch (error) {
      throw handleExceptions(error);
    }
  }

  async enableStation(stationId: string) {
    try {
      const station = await this.findOne(stationId);

      if (!station) {
        throw new NotFoundException(`¡La estación con ID ${stationId} no fue encontrada!`);
      }

      await this.stationRepository.update(stationId, { estatus: true });

      return await this.findOne(stationId);
    } catch (error) {
      throw handleExceptions(error);
    }
  }

  async getStationsByServiceType(providerId: string, serviceTypes: string[], typeEvent: TYPE_EVENT_STATION) {
    try {
      const activating = typeEvent === TYPE_EVENT_STATION.ACTIVATE_STATION;

      const provider = await this.providerRepository.findOne({
        where: { id: providerId },
        relations: ["estaciones", "estaciones.servicios"],
      });

      if (!provider) {
        throw new NotFoundException(`El proveedor con ID ${providerId} no fue encontrado.`);
      }

      const servicesToModify: string[] = [];

      for (const station of provider.estaciones) {
        // Filtrar servicios cuyo tipo coincide y que necesitan cambiar su estado
        const servicesMatchingCriteria = station.servicios.filter(service =>
          serviceTypes.includes(service.tipoDeServicio) && service.estatus !== activating
        );

        // Agregar los IDs de los servicios a la lista de modificaciones
        servicesMatchingCriteria.forEach(service => {
          servicesToModify.push(service.id);
        });

        // Se cuente cuántos servicios *actualmente* están activos en la estación
        const currentActiveCount = station.servicios.filter(s => s.estatus === true).length;
        // Se calcula cuántos servicios quedarán activos después de aplicar los cambios
        let activeCountAfterUpdate = currentActiveCount;
        if (activating) {
          // Se activan los servicios inactivos encontrados
          activeCountAfterUpdate += servicesMatchingCriteria.length;
        } else {
          // Se desactivab los servicios activos encontrados
          activeCountAfterUpdate -= servicesMatchingCriteria.length;
        }

        // Se activa la estación si pasa de 0 a tener al menos 1 servicio activo
        if (activating && currentActiveCount === 0 && activeCountAfterUpdate > 0) {
          console.log(`🚀 Activando estación: ${station.id}`);
          await this.enableStation(station.id);
        }

        // Se desactiva la estación si pasa de tener servicios activos a 0 activos 
        if (!activating && currentActiveCount > 0 && activeCountAfterUpdate === 0) {
          console.log(`🚨 Desactivando estación: ${station.id}`);
          await this.disableStation(station.id);
        }

        // Si la estación ya tenía servicios activos y no se desactivan todos, permanece activa (no se desactiva).
        // Si la estación ya estaba inactiva y no se activa ningún servicio, permanece inactiva (no se activa).
      }

      // Emitir evento para activar/desactivar múltiples servicios si hay cambios
      if (servicesToModify.length > 0) {
        const eventName = activating ? "enable-multiple-services" : "disable-multiple-services";
        this.eventEmitter.emit(eventName, { typeServicesId: servicesToModify });
      }

    } catch (error) {
      throw handleExceptions(error);
    }
  }

  async getStatus(stationId: string) {
    try {
      const station = await this.stationRepository.findOneBy({ id: stationId });

      if (!station) {
        throw new NotFoundException(`¡La estación con ID ${stationId} no fue encontrada!`);
      }

      return {
        stationId,
        estatus: station.estatus
      };
    } catch (error) {
      throw handleExceptions(error);
    }
  }

  async delete(stationId: string) {
    try {
      const station = await this.findOne(stationId);

      if (!station) {
        throw new NotFoundException(`¡La estación con ID ${stationId} no fue encontrada!`);
      }

      await this.stationRepository.delete(stationId);

      return { message: `Estación con ID ${stationId} eliminada correctamente.` };
    } catch (error) {
      throw handleExceptions(error);
    }
  }
}
