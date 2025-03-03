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

@Injectable()
export class EstacionService {

  constructor(
    @InjectRepository(Estacion)
    private estacionRepository: Repository<Estacion>,
    @InjectRepository(Proveedor)
    private proveedorRepository: Repository<Proveedor>,
    private readonly municipioService: MunicipioService,

    private eventEmitter: EventEmitter2,

  ) { }

  async create(createEstacionDto: CreateEstacionDto) {
    try {

      const { municipiosIds, proveedorId, ...rest } = createEstacionDto;

      let municipios = [];
      for (const municipio of municipiosIds) {
        const municipioDb = await this.municipioService.findOne(municipio)
        municipios.push(municipioDb);
      }

      const proveedor = await this.proveedorRepository.findOneBy({ id: proveedorId });
      if (!proveedor) throw new NotFoundException('Proveedor no encontrado, crear primero proveedor');

      const estacion = this.estacionRepository.create({
        municipios: municipios,
        proveedor: proveedor,
        ...rest
      });

      await this.estacionRepository.save(estacion);
      return estacion;

    } catch (error) {
      handleExceptions(error);
    }
  }


  async findAllBusqueda() {
    try {
      const estaciones = await this.estacionRepository.find({
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
      const estaciones = await this.estacionRepository.find({
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
      const estaciones = await this.estacionRepository.find({
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
      const estacion = await this.estacionRepository.findOne({
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

  async update(stationId: string, updateEstacionDto: UpdateEstacionDto) {
    try {

      const { municipiosIds, ...rest } = updateEstacionDto;
      const station = await this.estacionRepository.findOne({
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

      await this.estacionRepository.save(station);
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

      await this.estacionRepository.update(stationId, { estatus: false });

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

      await this.estacionRepository.update(stationId, { estatus: true });

      return await this.findOne(stationId);
    } catch (error) {
      throw handleExceptions(error);
    }
  }

  async getStationsByServiceType(providerId: string, serviceTypes: string[]) {
    try {
      // Buscar proveedor con estaciones y sus servicios
      const provider = await this.proveedorRepository.findOne({
        where: { id: providerId },
        relations: ["estaciones", "estaciones.servicios"],
      });

      if (!provider) {
        throw new NotFoundException(`El proveedor con ID ${providerId} no fue encontrado.`);
      }

      const servicesToDisable: string[] = [];

      for (const station of provider.estaciones) {
        const activeServices = station.servicios.filter(service => service.estatus === true);
        const servicesMatchingCriteria = station.servicios.filter(service => serviceTypes.includes(service.tipoDeServicio));

        servicesMatchingCriteria.forEach(service => {
          if (service.estatus === true) {
            servicesToDisable.push(service.id);
          }
        });

        const remainingActiveServices = activeServices.filter(service => !servicesToDisable.includes(service.id));

        if (remainingActiveServices.length === 0) {
          console.log(`🚨 Desactivando estación: ${station.id}`);
          await this.disableStation(station.id);
        }
      }

      if (servicesToDisable.length > 0) {
        this.eventEmitter.emit("disable-multiple-services", { providerId, typeServicesId: servicesToDisable });
      }

    } catch (error) {
      throw handleExceptions(error);
    }
  }



  async getStatus(stationId: string) {

    try {
      const station = await this.estacionRepository.findOneBy({ id: stationId });

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

      await this.estacionRepository.delete(stationId);

      return { message: `Estación con ID ${stationId} eliminada correctamente.` };
    } catch (error) {
      throw handleExceptions(error);
    }
  }
}
