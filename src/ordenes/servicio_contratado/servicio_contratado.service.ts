import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContractedServiceDto } from './dto/create-servicio_contratado.dto';
import { UpdateServicioContratadoDto } from './dto/update-servicio_contratado.dto';
import { Repository } from 'typeorm';
import { ServicioContratado } from './entities/servicio_contratado.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { CarteleraGobierno } from '../cartelera_gobierno/entities/cartelera_gobierno.entity';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { Orden } from '../orden/entities/orden.entity';

@Injectable()
export class ServicioContratadoService {

  constructor(
    @InjectRepository(ServicioContratado)
    private servicioContratadoRepository: Repository<ServicioContratado>,

    @InjectRepository(CarteleraGobierno)
    private carteleraGobiernoRepository: Repository<CarteleraGobierno>,

    @InjectRepository(Orden)
    private ordenRepository: Repository<Orden>
  ) { }

  async create(createServicioContratadoDto: CreateContractedServiceDto) {
    try {

      let cartelera = null;
      const { carteleraId, ordenId, cantidad, ...rest } = createServicioContratadoDto;
      if (carteleraId) {
        cartelera = await this.carteleraGobiernoRepository.findOneBy({ id: carteleraId });
        if (!cartelera) throw new NotFoundException('No se encuentra la cartelera');
      }

      const orden = await this.ordenRepository.findOneBy({ id: ordenId });
      if (!orden) throw new NotFoundException('No se encuentra la orden');

      const servicioContratado = this.servicioContratadoRepository.create({
        ...rest, // primero todo lo que venga
        cantidad: Number(cantidad),
        cartelera,
        ordenDeServicio: orden,
        servicio: {
          ...rest.servicio,
          tarifaUnitaria: Number(rest.servicio.tarifaUnitaria),
        },
      });
      

      await this.servicioContratadoRepository.save(servicioContratado);
      return servicioContratado;

    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter()
      const serviciosContratados = await this.servicioContratadoRepository.find({
        take: paginationSetter.castPaginationLimit(),
        skip: paginationSetter.getSkipElements(pagina),
        relations: {
          cartelera: true,
          ordenDeServicio: true,
        },
        select: {
          ordenDeServicio: {
            id: true
          }
        }
      });
      return serviciosContratados;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const servicioContratado = await this.servicioContratadoRepository.findOne({
        where: { id: id },
        relations: {
          cartelera: true,
          ordenDeServicio: true
        }, select: {
          ordenDeServicio: {
            id: true
          }
        }
      });
      if (!servicioContratado) throw new NotFoundException('No se encuentra el servicio contratado');
      return servicioContratado;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async update(id: string, updateServicioContratadoDto: UpdateServicioContratadoDto) {
    try {
      const servicioContratado = await this.findOne(id);
      if (servicioContratado) {
        const { servicio, carteleraId, cantidad, ...rest } = updateServicioContratadoDto;
        let cartelera = null;

        if (carteleraId) {
          cartelera = await this.carteleraGobiernoRepository.findOneBy({ id: carteleraId });
          if (!cartelera) throw new NotFoundException('No se encuentra la cartelerea');
        }
        await this.servicioContratadoRepository.update(id, {
          cantidad: Number(cantidad),
          servicio: Object(servicio),
          cartelera: cartelera,
          ...rest
        });
      }
      return await this.findOne(id);
    } catch (error) {
      handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const servicioContratado = await this.findOne(id);
      if (servicioContratado) {
        await this.servicioContratadoRepository.delete(id);
        return { message: 'Servicio de orden eliminado correctamente' };
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

}
