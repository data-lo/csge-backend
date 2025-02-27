import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { EstacionService } from '../estacion/estacion.service';
import { flattenCaracteristica } from 'src/helpers/flattenCaracterisitcas.function';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ServicioEvent } from './interfaces/servicio-event';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServicioService {

  constructor(
    @InjectRepository(Servicio)
    private servicioRepository: Repository<Servicio>,

    @InjectRepository(Proveedor)
    private proveedorRepository: Repository<Proveedor>,

    private estacionService: EstacionService,
    private eventEmitter: EventEmitter2,
  ) { }

  async create(createServicioDto: CreateServicioDto) {
    try {
      const { estacionId, ...rest } = createServicioDto;
      const estacionDb = await this.estacionService.findOne(createServicioDto.estacionId);
      const servicio = this.servicioRepository.create({
        estacion: estacionDb,
        ...rest
      });

      await this.servicioRepository.save(servicio);
      delete servicio.estacion;
      return servicio;
    } catch (error) {
      handleExeptions(error);
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
      handleExeptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter()
      const servicios = await this.servicioRepository.find({
        take: paginationSetter.castPaginationLimit(),
        skip: paginationSetter.getSkipElements(pagina),
        relations: { renovaciones: true }
      });
      return servicios;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const service = await this.servicioRepository.findOne({
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

      lastRenewal.ivaIncluido = false;

      if (!lastRenewal) throw new NotFoundException('¡No se encontró la renovación!');

      delete lastRenewal.fechaDeCreacion;

      delete service.renovaciones;

      service.renovaciones = [lastRenewal];

      return service;

    } catch (error) {
      handleExeptions(error);
    }
  }

  async desactivarServicio(id: string) {
    try {
      const servicio = await this.servicioRepository.findOneBy({ id: id });
      if (!servicio) throw new NotFoundException('¡El servicio no fue encontrado!');

      await this.servicioRepository.update(
        id, {
        estatus: false
      });
      await this.emitter(servicio.id, 'servicio.desactivado');
      return { message: 'Servicio desactivado correctamente' };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async updateService(updateServiceDto: UpdateServicioDto, id: string) {

    try {
      const service = await this.servicioRepository.findOneBy({ id: id });

      if (!service) throw new NotFoundException('¡El servicio no fue encontrado!');

      await this.servicioRepository.update(
        id, {
        nombreDeServicio: updateServiceDto.nombreDeServicio,
        tipoDeServicio: updateServiceDto.tipoDeServicio
      });

      return { message: '¡El servicio ha sido actualizado con éxito!' };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async activarServicio(id: string) {
    try {
      const servicio = await this.servicioRepository.findOneBy({ id: id });
      if (!servicio) throw new NotFoundException('No se encuentra el servicio');
      servicio.estatus = true;
      await this.servicioRepository.save(servicio);
      await this.emitter(servicio.id, 'servicio.activado');
      return { message: 'Servicio activado correctamente' };
    } catch (error) {
      handleExeptions(error);
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
      handleExeptions(error);
    }
  }

  private emitter(servicioId: string, evento: string) {
    this.eventEmitter.emit(
      `${evento}`,
      new ServicioEvent(servicioId)
    )
  }

}
