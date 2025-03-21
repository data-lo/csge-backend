import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRenovacionDto } from './dto/create-renovacion.dto';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Renovacion } from './entities/renovacion.entity';
import { DeepPartial, Repository } from 'typeorm';
import { IvaGetter } from 'src/helpers/iva.getter';
import { Servicio } from '../servicio/entities/servicio.entity';

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

  async create(createRenovationDto: CreateRenovacionDto) {
    try {
      let { isBorderTax, isTaxIncluded, tax, serviceId, unitPrice, characteristicOfService, description } = createRenovationDto;

      if (!serviceId) {
        throw new BadRequestException('¡El ID del servicio es obligatorio!');
      }

      // Buscar el servicio
      const service = await this.servicioRepository.findOne({
        where: { id: serviceId }
      });

      if (!service) {
        throw new NotFoundException('¡Servicio no encontrado!');
      }

      // Calcular IVA
      if (isTaxIncluded) {
        const taxAmount = await this.ivaGetter.calculateTaxBreakdown(unitPrice, isBorderTax);
        unitPrice = taxAmount.unitPrice;
        tax = taxAmount.tax;
      } else {
        tax = (await this.ivaGetter.getTax(unitPrice, isBorderTax)).toString();
      }

      // Verificar si es la primera renovación
      const isFirstTime = await this.isFirstRenovation(serviceId);

      if (!isFirstTime) {
        await this.newRenovation(serviceId);
      }

      console.log(tax);
      console.log(unitPrice);

      const renovacion = {
        servicio: service,
        caracteristicasDelServicio: characteristicOfService,
        tarifaUnitaria: unitPrice,
        fechaDeCreacion: new Date(),
        iva: tax,
        esUltimaRenovacion: isFirstTime,
        descripcionDelServicio: description
      };

      await this.renovacionRepository.save(renovacion);


      // Devolver sin la relación de servicio
      const renovacionSinServicio = { ...renovacion };
      delete renovacionSinServicio.servicio;

      return renovacionSinServicio;

    } catch (error: any) {
      handleExceptions(error);
    }

  }

  async findOne(id: string) {
    try {
      const renovacion = await this.renovacionRepository.findOneBy({ id: id })
      if (!renovacion) throw new NotFoundException('No se encuentra la renovacion');
      return renovacion;
    } catch (error: any) {
      handleExceptions(error)
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
      handleExceptions(error)
    }
  }

  async obtenerEstatus(id: string) {
    try {
      const renovacionDb = await this.findOne(id);
      if (renovacionDb) {
        return { renovacionId: `${id}`, estatus: renovacionDb.estatus };
      }
    } catch (error: any) {
      handleExceptions(error)
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
      handleExceptions(error);
    }
  }

  async isFirstRenovation(servicioId: string) {
    try {
      const renovaciones = await this.obtenerRenovaciones(servicioId);
      if (renovaciones.length < 1) {
        return true;
      }
      return false;
    } catch (error) {
      ;
      handleExceptions(error);
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
      handleExceptions(error)
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

      renovacion.estatus = false;
      await this.renovacionRepository.save(renovacion);
      return;

    } catch (error: any) {
      handleExceptions(error)
    }
  }

  async newRenovation(servicioId: string) {
    try {
      const service = await this.servicioRepository.findOne({
        where: { id: servicioId },
        relations: {
          renovaciones: true
        }
      });

      if (!service) {
        throw new BadRequestException('No hay renovaciones para este servicio')
      }

      const renovation = service.renovaciones.find((renovacion) => {
        if (renovacion.esUltimaRenovacion === true) {
          return renovacion;
        }
      });

      renovation.estatus = false;

      renovation.esUltimaRenovacion = false;

      await this.renovacionRepository.save(renovation);

      return;
    } catch (error: any) {
      handleExceptions(error)
    }
  }
}
