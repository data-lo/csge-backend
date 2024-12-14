import {
  BadRequestException,
  Controller,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { Contrato } from './entities/contrato.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleExeptions } from '../../helpers/handleExceptions.function';
import { PaginationSetter } from '../../helpers/pagination.getter';
import { EstatusDeContrato } from '../interfaces/estatus-de-contrato';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContratoEvent } from '../interfaces/contrato-evento';

@Injectable()
export class ContratosService {
  constructor(
    private eventEmitter: EventEmitter2,

    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,

    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  async create(createContratoDto: CreateContratoDto) {
    try {
      let montoDisponible: number = 0.0;

      const {
        montoMaximoContratado,
        montoMinimoContratado,
        proveedorId,
        ...rest
      } = createContratoDto;

      if (montoMaximoContratado) {
        montoDisponible = montoMaximoContratado;
      } else {
        montoDisponible = montoMinimoContratado;
      }

      const proveedor = await this.proveedorRepository.findOne({
        where: { id: proveedorId },
      });

      const contrato = this.contratoRepository.create({
        montoMinimoContratado: montoMinimoContratado,
        montoMaximoContratado: montoMaximoContratado,
        montoDisponible: montoDisponible,
        proveedor: proveedor,
        ...rest,
      });

      await this.contratoRepository.save(contrato);
      return contrato;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter();
      const contratos = await this.contratoRepository.createQueryBuilder('contrato')
      .leftJoinAndSelect('contrato.proveedor', 'proveedor')
      .select([
        'contrato.id',
        'contrato.numeroDeContrato',
        'contrato.tipoDeServicio',
        'contrato.montoEjercido',
        'contrato.montoPagado',
        'contrato.montoDisponible',
        'contrato.estatusDeContrato',
        'proveedor.id',
        'proveedor.razonSocial',
      ])
      .skip(paginationSetter.getSkipElements(pagina))
      .take(paginationSetter.castPaginationLimit())
      .getMany();
      return contratos;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAllBusqueda() {
    try {
      const contratos = await this.contratoRepository.find({
        relations: {
          proveedor: true,
        },
      });
      return contratos;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const contrato = await this.contratoRepository.findOne({
        where: { id: id },
        relations: {
          contratosModificatorios: true,
          proveedor: true,
        },
      });
      if (!contrato) {
        throw new NotFoundException('El contrato no se encuentra');
      }
      return contrato;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerEstatus(id: string) {
    try {
      const contrato = await this.findOne(id);
      const estatusDeContrato = contrato.estatusDeContrato;
      return { estatus: estatusDeContrato };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async modificarEstatus(id: string, updateContratoDto: UpdateContratoDto) {
    try {
      const { estatusDeContrato, ...rest } = updateContratoDto;
      await this.contratoRepository.update(id, {
        estatusDeContrato: estatusDeContrato,
      });
      return {
        message: `Estatus de contrato actuzalizado a ${estatusDeContrato}`,
      };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async update(id: string, updateContratoDto: UpdateContratoDto) {
    try {
      const estatusDelContrato = await this.obtenerEstatus(id);
      const { proveedorId, ...rest } = updateContratoDto;

      if (!proveedorId)
        throw new BadRequestException(
          'No es posible modificar el proveedor, proveedorId no existe',
        );

      if (estatusDelContrato.estatus != EstatusDeContrato.PENDIENTE) {
        throw new BadRequestException(
          'El contrato no se encuentra PENDIENTE. Cancelar Contrato',
        );
      } else {
        const proveedor = await this.proveedorRepository.findOneBy({
          id: proveedorId,
        });
        await this.contratoRepository.update(id, {
          proveedor: proveedor,
          ...rest,
        });
        return await this.findOne(id);
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try {
      const estatusDelContrato = await this.obtenerEstatus(id);
      if (estatusDelContrato.estatus != EstatusDeContrato.PENDIENTE) {
        throw new BadRequestException(
          'El contrato no cuenta con estatus PENDIENTE. Cancelar Contrato',
        );
      } else {
        await this.contratoRepository.delete({ id: id });
        return { message: 'contrato eliminado' };
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async desactivarCancelarContrato(
    id: string,
    updateContratoDto: UpdateContratoDto,
  ) {
    const { estatusDeContrato, motivoCancelacion } = updateContratoDto;
    try {
      const estatusDeContratoDb = await this.obtenerEstatus(id);
      if (estatusDeContratoDb.estatus === EstatusDeContrato.LIBERADO) {
        const contrato = await this.findOne(id);
        await this.emiter(contrato, 'desactivado');
        await this.contratoRepository.update(id, {
          estatusDeContrato: estatusDeContrato,
          motivoCancelacion: motivoCancelacion,
        });
        return { message: `Estatus de contrato ${estatusDeContrato}` };
      } else {
        throw new BadRequestException(
          'El contrato se debe encontrar LIBERADO para desactivarse o cancelarse',
        );
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async actualizarMontosDelContrato(contratoId:string,subtotal:number,eventType){
    try{
      //CONSIDERAR CUANDO SE CANCELA UNA ORDEN FACTURADA
      //EMITIR FACTURA CANCELADA
      const contratoDb = await this.findOne(contratoId);
      switch(eventType){
        case 'orden.aprobada':
          contratoDb.montoEjercido = contratoDb.montoEjercido + subtotal;
          contratoDb.montoDisponible = contratoDb.montoDisponible - subtotal;
          break;
        case 'orden.cancelada':
          contratoDb.montoEjercido = contratoDb.montoEjercido - subtotal;
          contratoDb.montoDisponible = contratoDb.montoDisponible = subtotal;
          break;
        case 'factura.pagada':
          contratoDb.montoPagado = contratoDb.montoPagado + subtotal;
          break;
        case 'factura.cancelada':
      }

      await this.contratoRepository.save(contratoDb);
      return;

    }catch(error){
      handleExeptions(error);
    }
  }

  async descargarReporte() {}

  async emiter(contrato: Contrato, evento: string) {
    this.eventEmitter.emit(
      `contrato.${evento}`,
      new ContratoEvent({contrato}),
    );
  }

}
