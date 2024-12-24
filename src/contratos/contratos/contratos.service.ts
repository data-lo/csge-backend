import {
  BadRequestException,
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
import { LoggerService } from 'src/logger/logger.service';
import { ContratoMaestro } from './entities/contrato.maestro.entity';

@Injectable()
export class ContratosService {

  private readonly logger = new LoggerService(ContratosService.name);
 
  constructor(
    private eventEmitter: EventEmitter2,
    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,

    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,

    @InjectRepository(ContratoMaestro)
    private readonly contratoMaestroRepository: Repository<ContratoMaestro>,

  ) {}

  async create(createContratoDto: CreateContratoDto) {
    try {
      let montoDisponible: number = 0.0;

      const {
        montoMaximoContratado,
        montoMinimoContratado,
        tipoDeServicios,
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

      const contratoMaestro = await this.contratoMaestroRepository.create({
        montoMinimoContratado: montoMinimoContratado,
        montoMaximoContratado: montoMaximoContratado,
        montoDisponible: montoDisponible,
        proveedor: proveedor,
        ...rest,
      });

      await this.contratoMaestroRepository.save(contratoMaestro);

      for (let i = 0; i < tipoDeServicios.length; i++) {
        const contrato = this.contratoRepository.create({
          tipoDeServicio: tipoDeServicios[i],
          contratoMaestro: contratoMaestro,
          numeroDeContrato: contratoMaestro.numeroDeContrato
        });
        await this.contratoRepository.save(contrato);
      }
      
      return contratoMaestro;

    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter();
      const contratos = await this.contratoMaestroRepository.createQueryBuilder('contratoMaestro')
      .leftJoinAndSelect('contrato_maestro.proveedor', 'proveedor')
      .leftJoinAndSelect('contrato_maestro.contratos', 'contratos')
      .select([
        'contratoMaestro.id',
        'contratoMaestro.numeroDeContrato',
        'contratoMaestro.tipoDeServicio',
        'contratoMaestro.montoEjercido',
        'contratoMaestro.montoPagado',
        'contratoMaestro.montoDisponible',
        'contratoMaestro.estatusDeContrato',
        'contratos.tipoDeServicio',
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
      const contratos = await this.contratoMaestroRepository.find({
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
      const contrato = await this.contratoMaestroRepository.findOne({
        where: { id: id },
        relations: {
          contratos:true,
          proveedor:true,
          contratosModificatorios:true
        },
      });
      if (!contrato) throw new NotFoundException('El contrato no se encuentra');
      return contrato;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerEstatus(id: string) {
    try {

      const contratoMaestro = await this.contratoMaestroRepository.findOne({
        where: { id: id },
        select:{estatusDeContrato:true}
      })
      if(!contratoMaestro) throw new NotFoundException('El contrato no se encuentra');
      return { estatus: contratoMaestro.estatusDeContrato };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerTipoDeServicioContratado(proveedorId:string){
   try{
      const contratos = await this.contratoMaestroRepository.createQueryBuilder('contratoMaestro')
      .leftJoinAndSelect('contratoMaestro.contratos','contrato')
      .select(['contrato.tipoDeServicio'])
      .where('contratoMaestro.proveedor = :proveedorId',{proveedorId})
      .andWhere('(contratoMaestro.estatus_de_contrato = :liberado OR contratoMaestro.estatus_de_contrato = :adjudicado)', {
        adjudicado: 'ADJUDICADO',
        liberado: 'LIBERADO',
      })      
      .getMany();
      return contratos;

    }catch(error){
      handleExeptions(error);
    }
  }


  async modificarEstatus(id: string, updateContratoDto: UpdateContratoDto) {
    try {
      const {estatusDeContrato} = updateContratoDto;
      await this.contratoMaestroRepository.update(id,{
        estatusDeContrato:estatusDeContrato
      })
      this.emitter(id,estatusDeContrato.toLowerCase())
      return {
        message: `Estatus de contrato actuzalizado a ${estatusDeContrato}`,
      };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async update(id: string, updateContratoDto: UpdateContratoDto) {
    try {
      const contratoMaestroDb = await this.contratoMaestroRepository.findOne({
        where: { id: id },
        relations: {
          contratos:true
        }
      });

      const { proveedorId, linkContrato, tipoDeServicios, ...rest } = updateContratoDto;
      const { estatusDeContrato } = contratoMaestroDb;
      if (!proveedorId)
        throw new BadRequestException(
          'No es posible modificar el proveedor, proveedorId no existe',
        );
      if (
        estatusDeContrato !== EstatusDeContrato.ADJUDICADO || EstatusDeContrato.PENDIENTE
      ) {
        throw new BadRequestException(
          'El contrato no se encuentra PENDIENTE O ADJUDICADO Cancelar Contrato',
        );
      } 
      
      const proveedor = await this.proveedorRepository.findOneBy({
        id: proveedorId,
      });
      
      if(estatusDeContrato === EstatusDeContrato.ADJUDICADO){
        await this.contratoMaestroRepository.update(id,{
          linkContrato:linkContrato
        });
        return {message:'Link del contrato actuzlizado exitosamente'};
      }
      
      if(tipoDeServicios){
        for(const contrato of contratoMaestroDb.contratos){
          await this.contratoRepository.remove(contrato)
        }
        for(const tipoDeServicio of tipoDeServicios){
          const contrato = await this.contratoRepository.create({
            tipoDeServicio:tipoDeServicio,
            contratoMaestro:contratoMaestroDb,
            numeroDeContrato:contratoMaestroDb.numeroDeContrato
          });
          await this.contratoRepository.save(contrato);
        }
      }

      await this.contratoMaestroRepository.update(id, {
        proveedor: proveedor,
        linkContrato: linkContrato,
        ...rest,
      });
      
      return {message:'contrato actualizado con exito'};
    
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
        
        const contratoMaestroDb = await this.contratoMaestroRepository.findOneBy({id:id});

        await this.emitter(contratoMaestroDb.id, 'desactivado');
        
        await this.contratoMaestroRepository.update(id, {
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


  //manejar para cada caso de contrato y contrato maestro:
  //pendiente

  async actualizarMontosDelContrato(contratoId:string,subtotal:number,eventType){
    try{

      //m


      const contratoDb = await this.findOne(contratoId);
      let {montoEjercido, montoDisponible, montoPagado} = contratoDb;
      switch(eventType){
        case 'orden.aprobada':
          montoEjercido = montoEjercido + subtotal;
          montoDisponible = montoDisponible - subtotal;
          contratoDb.montoEjercido = Number(montoEjercido);
          contratoDb.montoDisponible = Number(montoDisponible);
          break;
        case 'orden.cancelada':
          montoEjercido = montoEjercido - subtotal;
          montoDisponible = montoDisponible + subtotal;
          contratoDb.montoEjercido = Number(montoEjercido);
          contratoDb.montoDisponible = Number(montoDisponible);
          break;
        case 'factura.pagada':
          montoEjercido = montoEjercido - subtotal;
          montoPagado = montoPagado + subtotal;
          contratoDb.montoPagado = Number(montoPagado);
          break;
      }
      await this.contratoRepository.save(contratoDb)
      this.logger.log(`${eventType}:${contratoId},MONTO ACTUALIZADO:${subtotal}`);
      return;

    }catch(error){
      handleExeptions(error);
    }
  }

  async descargarReporte() {}

  async emitter(contratoMaestroId:string, evento: string) {
    this.eventEmitter.emit(
      `contrato.${evento}`,
      new ContratoEvent(contratoMaestroId),
    );
  }

}
