import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRenovacionDto } from './dto/create-renovacion.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Renovacion } from './entities/renovacion.entity';
import { Repository } from 'typeorm';
import { IvaGetter } from 'src/helpers/iva.getter';
import { Servicio } from '../servicio/entities/servicio.entity';
import { Console, error } from 'console';

@Injectable()
export class RenovacionService {

  constructor(
    @InjectRepository(Renovacion)
    private readonly renovacionRepository: Repository<Renovacion>,
    @Inject(IvaGetter)
    private readonly ivaGetter: IvaGetter,
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>
  ) { }

  async create(createRenovacionDto: CreateRenovacionDto) {
    try {

      let { tarifaUnitaria, ivaFrontera, servicioId, iva, ...rest } = createRenovacionDto;

      if (!servicioId) throw new BadRequestException('¡El ID del servicio es obligatorio!');

      const service = await this.servicioRepository.findOne({ where: { id: servicioId }, });

      if (!service) throw new NotFoundException('¡Servicio no encontrado!');

      if (createRenovacionDto.ivaIncluido) {
        const ivaDesglosado = await this.ivaGetter.desglosarIva(tarifaUnitaria, ivaFrontera);
        tarifaUnitaria = ivaDesglosado.tarifa,
          iva = ivaDesglosado.iva
      }

      if (!createRenovacionDto.ivaIncluido) {
        iva = await this.ivaGetter.obtenerIva(tarifaUnitaria, ivaFrontera);
      }

      if (!(await this.esPrimerRenovacion(servicioId))) {
        await this.hayNuevaRenovacion(servicioId);
      }


      const renovacion = this.renovacionRepository.create({
        servicio: service,
        tarifaUnitaria: tarifaUnitaria,
        fechaDeCreacion: new Date(),
        iva: iva,
        esUltimaRenovacion: true,
        ...rest
      });

      await this.renovacionRepository.save(renovacion);
      
      delete renovacion.servicio;

      return renovacion;

    } catch (error: any) {
      handleExeptions(error)
    }
  }

  async findOne(id: string) {
    try {
      const renovacion = await this.renovacionRepository.findOneBy({ id: id })
      if (!renovacion) throw new NotFoundException('No se encuentra la renovacion');
      return renovacion;
    } catch (error: any) {
      handleExeptions(error)
    }
  }

  async remove(id: string) {
    try {
      const renovacionDb = await this.findOne(id);
      if (renovacionDb) {
        await this.renovacionRepository.delete(id);
        return { message: 'Renovacion eliminada existosamente' };
      }
    } catch (error: any) {
      handleExeptions(error)
    }
  }

  async obtenerEstatus(id: string) {
    try {
      const renovacionDb = await this.findOne(id);
      if (renovacionDb) {
        return { renovacionId: `${id}`, estatus: renovacionDb.estatus };
      }
    } catch (error: any) {
      handleExeptions(error)
    }
  }

  async obtenerRenovaciones(servicioId: string) {
    try {
      const servicioDb = await this.servicioRepository.findOne({
        where: { id: servicioId },
        relations: {
          renovaciones: true
        }
      });
      if (!servicioDb) throw new BadRequestException('El servicio no se encuentra');
      return servicioDb.renovaciones;

    } catch (error: any) {
      handleExeptions(error);
    }
  }

  async esPrimerRenovacion(servicioId: string) {
    try {
      const renovaciones = await this.obtenerRenovaciones(servicioId);
      if (renovaciones.length < 1) {
        return true;
      }
      return false;
    } catch (error) {
      ;
      handleExeptions(error);
    }
  }


  async activarUltimaRenovacion(servicioId: string) {
    try {
      const servicioDb = await this.servicioRepository.findOne({
        where: { id: servicioId },
        relations: {
          renovaciones: true
        }
      });
      const renovacion = servicioDb.renovaciones.find((renovacion) => {
        if (renovacion.esUltimaRenovacion === true) {
          return renovacion;
        }
      });
      renovacion.estatus = true;
      await this.renovacionRepository.save(renovacion);
      return;
    } catch (error: any) {
      handleExeptions(error)
    }
  }

  async desactivarUltimaRenovacion(servicioId: string) {
    try {

      const servicioDb = await this.servicioRepository.findOne({
        where: { id: servicioId },
        relations: {
          renovaciones: true
        }
      });

      if (!servicioDb) throw new NotFoundException('El servicio no se encuentra');

      const renovacion = servicioDb.renovaciones.find((renovacion) => {
        if (renovacion.esUltimaRenovacion === true) {
          return renovacion;
        }
      });

      if (!renovacion) throw new InternalServerErrorException('No se encuentra la renovacion');

      console.log(renovacion);
      renovacion.estatus = false;
      await this.renovacionRepository.save(renovacion);
      return;

    } catch (error: any) {
      handleExeptions(error)
    }
  }

  async hayNuevaRenovacion(servicioId: string) {
    try {
      const servicioDb = await this.servicioRepository.findOne({
        where: { id: servicioId },
        relations: {
          renovaciones: true
        }
      });

      if (!servicioDb) throw new BadRequestException('No hay renovaciones para este servicio');

      const renovacion = servicioDb.renovaciones.find((renovacion) => {
        if (renovacion.esUltimaRenovacion === true) {
          return renovacion;
        }
      });

      renovacion.estatus = false;
      renovacion.esUltimaRenovacion = false;
      await this.renovacionRepository.save(renovacion);
      return;

    } catch (error: any) {
      handleExeptions(error)
    }
  }
}
