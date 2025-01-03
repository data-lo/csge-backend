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
import { TipoDeServicio } from '../interfaces/tipo-de-servicio';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';


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

    @InjectRepository(Orden)
    private readonly ordenRepository: Repository<Orden>,
  ) {}

  async create(createContratoDto: CreateContratoDto) {
    try {
      let montoDisponible: number = 0.0;
      let montoMinVar = 0;
      let ivaMontoMin = 0;

      const {
        montoMaximoContratado,
        montoMinimoContratado,
        ivaMontoMaximoContratado,
        ivaMontoMinimoContratado,
        tipoDeServicios,
        proveedorId,
        ...rest
      } = createContratoDto;

      montoDisponible = montoMaximoContratado + ivaMontoMaximoContratado;

      const proveedor = await this.proveedorRepository.findOne({
        where: { id: proveedorId },
      });

      if (montoMinimoContratado !== 0) {
        montoMinVar = montoMinimoContratado;
        ivaMontoMin = ivaMontoMinimoContratado;
      }

      const contratoMaestro = await this.contratoMaestroRepository.create({
        ivaMontoMaximoContratado: ivaMontoMaximoContratado,
        ivaMontoMinimoContratado: ivaMontoMin,
        montoMinimoContratado: montoMinVar,
        montoMaximoContratado: montoMaximoContratado,
        montoDisponible: montoDisponible,
        proveedor: proveedor,
        ...rest,
      });

      await this.contratoMaestroRepository.save(contratoMaestro);

      try {
        for (let i = 0; i < tipoDeServicios.length; i++) {
          const contrato = this.contratoRepository.create({
            tipoDeServicio: tipoDeServicios[i],
            contratoMaestro: contratoMaestro,
            numeroDeContrato: contratoMaestro.numeroDeContrato,
          });
          await this.contratoRepository.save(contrato);
        }
      } catch (error) {
        await this.remove(contratoMaestro.id);
      }
      return contratoMaestro;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter();
      const contratos = await this.contratoMaestroRepository
        .createQueryBuilder('contratoMaestro')
        .leftJoinAndSelect('contratoMaestro.proveedor', 'proveedor')
        .leftJoinAndSelect('contratoMaestro.contratos', 'contratos')
        .select([
          'contratoMaestro.id',
          'contratoMaestro.numeroDeContrato',
          'contratoMaestro.tipoDeContrato',
          'contratoMaestro.montoEjercido',
          'contratoMaestro.montoPagado',
          'contratoMaestro.montoDisponible',
          'contratoMaestro.estatusDeContrato',
          'contratos.id',
          'contratos.tipoDeServicio',
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
          contratos: true,
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
          contratos: true,
          proveedor: true,
          contratosModificatorios: true,
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
        select: { estatusDeContrato: true },
      });
      if (!contratoMaestro)
        throw new NotFoundException('El contrato no se encuentra');
      return { estatus: contratoMaestro.estatusDeContrato };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerTipoDeServicioContratado(proveedorId: string) {
    try {
      const contratos = await this.contratoMaestroRepository
        .createQueryBuilder('contratoMaestro')
        .innerJoinAndSelect('contratoMaestro.contratos', 'contrato')
        .where('contratoMaestro.proveedor = :proveedorId', { proveedorId })
        .andWhere(
          '(contratoMaestro.estatus_de_contrato = :liberado OR contratoMaestro.estatus_de_contrato = :adjudicado)',
          {
            adjudicado: 'ADJUDICADO',
            liberado: 'LIBERADO',
          },
        )
        .select([
          'contratoMaestro.id',
          'contrato.tipoDeServicio',
          'contrato.id',
        ])
        .getRawMany();

      const tipoDeServicio = contratos.map(
        (result) => result.contrato_tipo_de_servicio,
      );
      return tipoDeServicio;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async modificarEstatus(id: string, updateContratoDto: UpdateContratoDto) {
    try {
      const { estatusDeContrato } = updateContratoDto;
      const contratoMaestroDb = await this.contratoMaestroRepository.findOne({
        where: { id: id },
      });
      contratoMaestroDb.estatusDeContrato = estatusDeContrato;
      await this.contratoMaestroRepository.save(contratoMaestroDb);
      this.emitter(id, estatusDeContrato.toLowerCase());
      return {
        message: `Estatus de contrato actuzalizado a ${estatusDeContrato}`,
      };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async update(id: string, updateContratoDto: UpdateContratoDto) {
    try {
      const contratos: Contrato[] = [];
      const contratoMaestroDb = await this.contratoMaestroRepository.findOne({
        where: { id: id },
        relations: {
          contratos: true,
          proveedor: true,
        },
      });

      if (!contratoMaestroDb)
        throw new BadRequestException('No se encuentra el contrato');

      const {
        linkContrato,
        tipoDeServicios,
        montoMaximoContratado,
        ivaMontoMaximoContratado,
        ...rest
      } = updateContratoDto;
      const { estatusDeContrato } = contratoMaestroDb;
      
      const estatusPermitidos = [
        EstatusDeContrato.ADJUDICADO,
        EstatusDeContrato.PENDIENTE,
      ];

      if (!estatusPermitidos.includes(estatusDeContrato)) {
        throw new BadRequestException(
          'EL CONTRATO DEBE DE ENCONTRARSE ADJUDICADO O PENDIENTE PARA MODIFICARSE',
        );
      }

      if (estatusDeContrato === EstatusDeContrato.ADJUDICADO) {
        contratoMaestroDb.linkContrato = linkContrato;
        await this.contratoMaestroRepository.save(contratoMaestroDb);
        return { message: 'Link del contrato actuzlizado exitosamente' };
      }

      if (tipoDeServicios) {
        for (const contrato of contratoMaestroDb.contratos) {
          await this.contratoRepository.remove(contrato);
        }

        for (const tipoDeServicio of tipoDeServicios) {
          const contrato = this.contratoRepository.create({
            tipoDeServicio: tipoDeServicio,
            contratoMaestro: contratoMaestroDb,
            numeroDeContrato: contratoMaestroDb.numeroDeContrato,
          });
          await this.contratoRepository.save(contrato);
          contratos.push(contrato);
        }
      }

      const proveedorDb = await this.proveedorRepository.findOneBy({
        id: rest.proveedorId,
      });
      const montoDisponible = montoMaximoContratado + ivaMontoMaximoContratado;

      Object.assign(contratoMaestroDb, {
        ...rest,
        montoDisponible: montoDisponible,
        montoMaximoContratado: montoMaximoContratado,
        ivaMontoMaximoContratado: ivaMontoMaximoContratado,
        linkContrato: linkContrato,
        contratos: contratos,
        proveedor: proveedorDb,
        
      });

      await this.contratoMaestroRepository.save(contratoMaestroDb);
      return { message: 'contrato actualizado con exito' };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try {
      const contratoMaestroDb = await this.contratoMaestroRepository.findOne({
        where: { id: id },
        relations: {
          contratos: true,
        },
      });
      if (contratoMaestroDb.estatusDeContrato !== EstatusDeContrato.PENDIENTE) {
        throw new BadRequestException(
          'El contrato no cuenta con estatus PENDIENTE. Cancelar Contrato',
        );
      } else {
        for (const contrato of contratoMaestroDb.contratos) {
          await this.contratoRepository.remove(contrato);
        }
        await this.contratoMaestroRepository.remove(contratoMaestroDb);
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
      const { estatus } = await this.obtenerEstatus(id);
      const estatusPermitidos = [
        EstatusDeContrato.LIBERADO,
        EstatusDeContrato.ADJUDICADO,
      ];

      if (estatusPermitidos.includes(estatus)) {
        const contratoMaestroDb =
          await this.contratoMaestroRepository.findOneBy({ id: id });
        await this.emitter(contratoMaestroDb.id, 'desactivado');
        await this.contratoMaestroRepository.update(id, {
          estatusDeContrato: estatusDeContrato,
          motivoCancelacion: motivoCancelacion,
        });
        return { message: `Estatus de contrato ${estatus}` };
      } else {
        throw new BadRequestException(
          'EL CONTRATO SE DEBE ENCONTRAT LIBERADO O ADJUDICADO PARA CANCELARSE',
        );
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  //manejar para cada caso de contrato y contrato maestro:
  //pendiente

  async actualizarMontosDelContrato(
    contratoMaestroId: string,
    tipoDeServicio: TipoDeServicio,
    ordenDeServicioId: string,
    eventType,
  ) {
    try {
      const contratoMaestroDb = await this.contratoMaestroRepository.findOne({
        where: { id: contratoMaestroId },
        relations: {
          contratos: true,
        },
      });

      const ordenDeServicio = await this.ordenRepository.findOneBy({
        id: ordenDeServicioId,
      });

      const contratoAActualizar: Contrato = contratoMaestroDb.contratos.filter(
        (result) => {
          if (result.tipoDeServicio === tipoDeServicio) {
            return result;
          }
        },
      ).at[0];

      switch (eventType) {
        case 'orden.aprobada':
          //disminuye el monto disponible
          //aumenta el monto activo

          contratoMaestroDb.montoDisponible =
            contratoMaestroDb.montoDisponible - ordenDeServicio.total;

          contratoMaestroDb.montoActivo =
            contratoMaestroDb.montoActivo + ordenDeServicio.total;
          contratoAActualizar.montoActivo =
            contratoAActualizar.montoActivo + ordenDeServicio.total;

          break;
        case 'orden.cancelada':
          contratoMaestroDb.montoDisponible =
            contratoMaestroDb.montoDisponible + ordenDeServicio.total;

          contratoMaestroDb.montoActivo =
            contratoMaestroDb.montoActivo - ordenDeServicio.total;
          contratoAActualizar.montoActivo =
            contratoAActualizar.montoActivo - ordenDeServicio.total;

          break;

        case 'orden.cotejada':
          //disminuye el monto Activo
          //Aumenta el monto Ejercido
          contratoMaestroDb.montoActivo =
            contratoMaestroDb.montoActivo - ordenDeServicio.total;
          contratoAActualizar.montoActivo =
            contratoAActualizar.montoActivo - ordenDeServicio.total;

          contratoMaestroDb.montoEjercido =
            contratoMaestroDb.montoEjercido + ordenDeServicio.total;
          contratoAActualizar.montoEjercido =
            contratoAActualizar.montoEjercido + ordenDeServicio.total;
          break;

        case 'orden.pagada':
          contratoMaestroDb.montoEjercido =
            contratoMaestroDb.montoEjercido - ordenDeServicio.total;
          contratoMaestroDb.montoPagado =
            contratoMaestroDb.montoPagado + ordenDeServicio.total;

          contratoAActualizar.montoEjercido =
            contratoAActualizar.montoEjercido - ordenDeServicio.total;
          contratoAActualizar.montoPagado =
            contratoAActualizar.montoPagado + ordenDeServicio.total;
          break;
      }
      await this.contratoMaestroRepository.save(contratoMaestroDb);
      await this.contratoRepository.save(contratoAActualizar);
      return;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async descargarReporte() {}

  async emitter(contratoMaestroId: string, evento: string) {
    this.eventEmitter.emit(
      `contrato.${evento}`,
      new ContratoEvent(contratoMaestroId),
    );
  }
}
