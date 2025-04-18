import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { Repository } from 'typeorm';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { EstacionService } from '../estacion/estacion.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ServicioEvent } from './interfaces/servicio-event';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServicioService {

  constructor(
    @InjectRepository(Servicio)
    private serviceRepository: Repository<Servicio>,

    @InjectRepository(Proveedor)
    private proveedorRepository: Repository<Proveedor>,

    private stationService: EstacionService,

    private eventEmitter: EventEmitter2,
  ) { }

  async create(createServicioDto: CreateServicioDto) {

    try {
      const { estacionId, ...rest } = createServicioDto;

      const station = await this.stationService.getStation(createServicioDto.estacionId);

      const servicio = this.serviceRepository.create({
        estacion: station,
        ...rest
      });

      await this.serviceRepository.save(servicio);

      return servicio;

    } catch (error) {
      handleExceptions(error);
    }
  }

  async findServiciosDelProveedor(proveedorId: string) {
    try {
      const services = await this.proveedorRepository.findOne({
        where: { id: proveedorId },
        relations: {
          estaciones: {
            servicios: true
          },
        },
      });

      const serviceArray = [];

      services.estaciones.forEach((estacion) => {
        estacion.servicios.forEach(servicio => {
          serviceArray.push(servicio);
        });
      });

      const servicesFromDB = [];
      for (const servicio of serviceArray) {
        servicesFromDB.push(await this.findOne(servicio.id));
      }

      return servicesFromDB;

    } catch (error) {
      handleExceptions(error);
    }
  }


  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter()
      const servicios = await this.serviceRepository.find({
        take: paginationSetter.castPaginationLimit(),
        skip: paginationSetter.getSkipElements(pagina),
        relations: { renovaciones: true }
      });
      return servicios;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const service = await this.serviceRepository.findOne({
        where: { id: id },
        relations: {
          renovaciones: true
        }
      });

      if (!service) throw new NotFoundException('¡El servicio no fue encontrado!');

      const lastRenewal = service.renovaciones.find((renovacion) => {
        if (renovacion.esUltimaRenovacion) {
          return renovacion;
        }
      });

      if (!lastRenewal) {
        throw new NotFoundException('¡No se encontró la renovación!');
      }

      delete lastRenewal.fechaDeCreacion;

      delete service.renovaciones;

      service.renovaciones = [lastRenewal];

      return service;

    } catch (error) {
      handleExceptions(error);
    }
  }

  async disableService(serviceId: string) {
    try {
      const servicio = await this.serviceRepository.findOneBy({ id: serviceId });

      if (!servicio) throw new NotFoundException('¡El servicio no fue encontrado!');

      await this.serviceRepository.update(serviceId, {
        estatus: false
      });

      return { message: "¡El servicio ha sido desactivado correctamente!" };

    } catch (error) {
      handleExceptions(error);
    }
  }

  async disableMultiplyServices(typeServicesId: string[]) {
    for (const serviceId of typeServicesId) {

      const service = await this.serviceRepository.findOneBy({ id: serviceId });

      if (!service) throw new NotFoundException('¡El servicio no fue encontrado!');

      await this.serviceRepository.update(serviceId, {
        estatus: false
      });
    }
  }

  async enableMultiplyServices(typeServicesId: string[]) {
    for (const serviceId of typeServicesId) {

      const service = await this.serviceRepository.findOneBy({ id: serviceId });

      if (!service) throw new NotFoundException('¡El servicio no fue encontrado!');

      await this.serviceRepository.update(serviceId, {
        estatus: true
      });
    }
  }


  async updateService(updateServiceDto: UpdateServicioDto, id: string) {

    try {
      const service = await this.serviceRepository.findOneBy({ id: id });

      if (!service) throw new NotFoundException('¡El servicio no fue encontrado!');

      await this.serviceRepository.update(
        id, {
        nombreDeServicio: updateServiceDto.nombreDeServicio,
        tipoDeServicio: updateServiceDto.tipoDeServicio
      });

      return { message: '¡El servicio ha sido actualizado con éxito!' };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async activarServicio(id: string) {
    try {
      const servicio = await this.serviceRepository.findOneBy({ id: id });
      if (!servicio) throw new NotFoundException('No se encuentra el servicio');
      servicio.estatus = true;
      await this.serviceRepository.save(servicio);
      await this.emitter(servicio.id, 'servicio.activado');
      return { message: 'Servicio activado correctamente' };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerEstatus(id: string) {
    try {
      const servicio = await this.findOne(id);
      return {
        id: servicio.id,
        estatus: servicio.estatus
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  private emitter(servicioId: string, evento: string) {
    this.eventEmitter.emit(
      `${evento}`,
      new ServicioEvent(servicioId)
    )
  }

}
