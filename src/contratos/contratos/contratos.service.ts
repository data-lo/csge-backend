import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { Contrato } from './entities/contrato.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleExceptions } from '../../helpers/handleExceptions.function';
import { PaginationSetter } from '../../helpers/pagination.getter';
import { ESTATUS_DE_CONTRATO } from '../interfaces/estatus-de-contrato';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoggerService } from 'src/logger/logger.service';
import { ContratoMaestro } from './entities/contrato.maestro.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { handlerAmounts } from './functions/handler-amounts';


@Injectable()
export class ContratosService {
  private readonly logger = new LoggerService(ContratosService.name);

  constructor(
    private eventEmitter: EventEmitter2,

    @InjectRepository(Contrato)
    private contractRepository: Repository<Contrato>,

    @InjectRepository(Proveedor)
    private readonly providerRepository: Repository<Proveedor>,

    @InjectRepository(ContratoMaestro)
    private readonly masterContractRepository: Repository<ContratoMaestro>,

    @InjectRepository(Orden)
    private readonly orderRepository: Repository<Orden>,
  ) { }

  async create(createContratoDto: CreateContratoDto) {
    try {
      const {
        montoMaximoContratado,
        montoMinimoContratado,
        ivaMontoMaximoContratado,
        ivaMontoMinimoContratado,
        tipoDeServicios,
        proveedorId,
        numeroDeContrato,
        ...rest
      } = createContratoDto;

      const exists = await this.masterContractRepository.exists({
        where: { numeroDeContrato },
      });

      if (exists) {
        throw new ConflictException('¡El número de contrato ya existe!');
      }

      const provider = await this.providerRepository.findOne({
        where: { id: proveedorId }
      });

      if (!provider) {
        throw new NotFoundException('¡El proveedor especificado no existe!');
      }

      const availableFunds = montoMaximoContratado + ivaMontoMaximoContratado;

      const masterContract = this.masterContractRepository.create({
        ivaMontoMaximoContratado,
        ivaMontoMinimoContratado,
        montoMinimoContratado,
        montoMaximoContratado,
        montoDisponible: availableFunds,
        proveedor: provider,
        numeroDeContrato: numeroDeContrato,
        ...rest,
      });

      await this.masterContractRepository.save(masterContract);

      try {

        const contratos = tipoDeServicios.map(service =>
          this.contractRepository.create({
            tipoDeServicio: service,
            contratoMaestro: masterContract,
            numeroDeContrato: masterContract.numeroDeContrato,
          })
        );

        await this.contractRepository.save(contratos);

      } catch (error) {

        await this.remove(masterContract.id);

        throw new InternalServerErrorException('¡Error al crear los contratos secundarios!');
      }

      const activeContractsCount = await this.countActiveContracts(provider.id);

      if (activeContractsCount == 0 && !provider.estatus) {
        this.eventEmitter.emit("enable-provider", {
          providerId: provider.id
        });
      }

      return masterContract;
    } catch (error) {
      handleExceptions(error);
    }
  }



  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter();
      const contratos = await this.masterContractRepository
        .createQueryBuilder('contratoMaestro')
        .leftJoinAndSelect('contratoMaestro.proveedor', 'proveedor')
        .leftJoinAndSelect('contratoMaestro.contratos', 'contratos')
        .select([
          'contratoMaestro.id',
          'contratoMaestro.numeroDeContrato',
          'contratoMaestro.tipoDeContrato',
          'contratoMaestro.montoActivo',
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
      handleExceptions(error);
    }
  }

  async findAllBusqueda() {
    try {
      const contratos = await this.masterContractRepository.find({
        relations: {
          proveedor: true,
          contratos: true,
        },
      });
      return contratos;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const contrato = await this.masterContractRepository.findOne({
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
      handleExceptions(error);
    }
  }

  async obtenerEstatus(id: string) {
    try {
      const contratoMaestro = await this.masterContractRepository.findOne({
        where: { id: id },
        select: { estatusDeContrato: true },
      });
      if (!contratoMaestro)
        throw new NotFoundException('El contrato no se encuentra');
      return { estatus: contratoMaestro.estatusDeContrato };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async getContractedServiceTypes(proveedorId: string) {
    try {
      const contract = await this.masterContractRepository
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

      const uniqueServiceTypes = [...new Set(contract.map((result) => result.contrato_tipo_de_servicio))];

      return uniqueServiceTypes;
    } catch (error) {
      handleExceptions(error);
    }
  }


  async modificarEstatus(id: string, updateContratoDto: UpdateContratoDto) {
    try {
      const { estatusDeContrato } = updateContratoDto;
      const contratoMaestroDb = await this.masterContractRepository.findOne({
        where: { id: id },
      });
      contratoMaestroDb.estatusDeContrato = estatusDeContrato;
      await this.masterContractRepository.save(contratoMaestroDb);
      // this.emitter(id, estatusDeContrato.toLowerCase());
      return {
        message: `Estatus de contrato actuzalizado a ${estatusDeContrato}`,
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async update(id: string, updateContratoDto: UpdateContratoDto) {
    try {
      const contratos: Contrato[] = [];
      const contratoMaestroDb = await this.masterContractRepository.findOne({
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
        ESTATUS_DE_CONTRATO.ADJUDICADO,
        ESTATUS_DE_CONTRATO.PENDIENTE,
      ];

      if (!estatusPermitidos.includes(estatusDeContrato)) {
        throw new BadRequestException(
          'EL CONTRATO DEBE DE ENCONTRARSE ADJUDICADO O PENDIENTE PARA MODIFICARSE',
        );
      }

      if (estatusDeContrato === ESTATUS_DE_CONTRATO.ADJUDICADO) {
        contratoMaestroDb.linkContrato = linkContrato;
        await this.masterContractRepository.save(contratoMaestroDb);
        return { message: 'Link del contrato actuzlizado exitosamente' };
      }

      if (tipoDeServicios) {
        for (const contrato of contratoMaestroDb.contratos) {
          await this.contractRepository.remove(contrato);
        }

        for (const typeService of tipoDeServicios) {
          const contrato = this.contractRepository.create({
            tipoDeServicio: typeService,
            contratoMaestro: contratoMaestroDb,
            numeroDeContrato: contratoMaestroDb.numeroDeContrato,
          });
          await this.contractRepository.save(contrato);
          contratos.push(contrato);
        }
      }

      const proveedorDb = await this.providerRepository.findOneBy({
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

      await this.masterContractRepository.save(contratoMaestroDb);
      return { message: 'contrato actualizado con exito' };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {

      const contratoMaestroDb = await this.masterContractRepository.findOne({
        where: { id: id },
        relations: { contratos: true },
      });

      if (contratoMaestroDb.estatusDeContrato !== ESTATUS_DE_CONTRATO.PENDIENTE) {
        throw new BadRequestException(
          'El contrato no cuenta con estatus PENDIENTE. Cancelar Contrato',
        );
      } else {
        for (const contrato of contratoMaestroDb.contratos) {
          await this.contractRepository.remove(contrato);
        }
        await this.masterContractRepository.remove(contratoMaestroDb);
      }
    } catch (error) {
      handleExceptions(error);
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
        ESTATUS_DE_CONTRATO.LIBERADO,
        ESTATUS_DE_CONTRATO.ADJUDICADO,
      ];

      if (estatusPermitidos.includes(estatus)) {
        const contratoMaestroDb =
          await this.masterContractRepository.findOneBy({ id: id });
        // await this.emitter(contratoMaestroDb.id, 'desactivado');
        await this.masterContractRepository.update(id, {
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
      handleExceptions(error);
    }
  }

  async updateContractAmountByOrder(orderId: string, masterContractId: string, eventType: TYPE_EVENT_ORDER | TYPE_EVENT_INVOICE) {

    const order = await this.orderRepository.findOne({ where: { id: orderId } })

    const masterContract = await this.masterContractRepository.findOne({
      where: { id: masterContractId },
      relations: { contratos: true },
    });

    const contractByServiceType = masterContract.contratos.find(contract => contract.tipoDeServicio === order.tipoDeServicio);

    const values = {
      masterContract: {
        availableAmount: masterContract.montoDisponible,
        paidAmount: masterContract.montoPagado,
        executedAmount: masterContract.montoEjercido,
        activeAmount: masterContract.montoActivo
      },
      contractByServiceType: {
        paidAmount: contractByServiceType.montoPagado,
        executedAmount: contractByServiceType.montoEjercido,
        activeAmount: contractByServiceType.montoActivo
      },
      eventType: eventType,
      totalOrder: order.total
    }

    const updatedValues = handlerAmounts(values);

    if (eventType === TYPE_EVENT_ORDER.ORDER_APPROVED || eventType === TYPE_EVENT_ORDER.ORDER_CANCELLED) {

      await this.contractRepository.update(contractByServiceType.id, {
        montoActivo: updatedValues.contractByServiceType.activeAmount
      });

      await this.masterContractRepository.update(masterContract.id, {
        montoDisponible: updatedValues.masterContract.availableAmount,
        montoActivo: updatedValues.masterContract.activeAmount
      });

    } else if (eventType === TYPE_EVENT_INVOICE.INVOICE_APPROVED || eventType === TYPE_EVENT_INVOICE.INVOICE_CANCELLED) {

      await this.contractRepository.update(contractByServiceType.id, {
        montoActivo: updatedValues.contractByServiceType.activeAmount,
        montoEjercido: updatedValues.contractByServiceType.executedAmount
      });

      await this.masterContractRepository.update(masterContract.id, {
        montoEjercido: updatedValues.masterContract.executedAmount,
        montoActivo: updatedValues.masterContract.activeAmount
      });
    }
  }

  async checkContractExpiration() {
    const today = new Date();

    // Obtener contratos que finalizan hoy con sus relaciones
    const masterContractsEndsToday = await this.masterContractRepository.find({
      where: { fechaFinal: today },
      relations: ["contratos", "proveedor"]
    });

    const contractsByProvider: Record<string, ContratoMaestro[]> = {};

    // Agrupar los contrato maestro por proveedor
    for (const masterContract of masterContractsEndsToday) {
      const providerId = masterContract.proveedor.id;

      if (!contractsByProvider[providerId]) {
        contractsByProvider[providerId] = [];
      }
      contractsByProvider[providerId].push(masterContract);
    }

    // Recorrer cada proveedor
    for (const [providerId, contratoMaestro] of Object.entries(contractsByProvider)) {
      // Obtener todos los servicios de los contratos secundarios que finalizan hoy
      const expiringServices = new Set<string>();

      // Recorrer cada contrato maestro
      for (const masterContract of contratoMaestro) {
        if (masterContract.estatusDeContrato !== ESTATUS_DE_CONTRATO.TERMINADO &&
          masterContract.estatusDeContrato !== ESTATUS_DE_CONTRATO.CANCELADO) {

          masterContract.contratos.forEach(subContract => {
            expiringServices.add(subContract.tipoDeServicio);
          });

          // Marcar el contrato maestro como terminado
          await this.masterContractRepository.update(masterContract.id, {
            estatusDeContrato: ESTATUS_DE_CONTRATO.TERMINADO,
          });

          this.logger.log(`✅ Contrato ${masterContract.numeroDeContrato} desactivado.`);
        }
      }

      const activeStatus = [
        ESTATUS_DE_CONTRATO.ADJUDICADO,
        ESTATUS_DE_CONTRATO.LIBERADO,
        ESTATUS_DE_CONTRATO.PENDIENTE
      ];

      // Obtener todos los contratos activos del proveedor
      const activeContracts = await this.masterContractRepository.find({
        where: {
          proveedor: { id: providerId },
          estatusDeContrato: In(activeStatus),
        },
        relations: ["contratos"]
      });

      // Obtener todos los servicios aún vigentes en contratos activos
      const activeServices = new Set<string>();

      activeContracts.forEach(contract => {
        contract.contratos.forEach(subContract => {
          activeServices.add(subContract.tipoDeServicio);
        });
      });

      const servicesToDisable = [...expiringServices].filter(service => !activeServices.has(service));

      if (servicesToDisable.length > 0) {
        this.eventEmitter.emit('disable-stations', {
          providerId: providerId, typeServices: servicesToDisable
        });
      }
    }
  }

  async countActiveContracts(providerId: string): Promise<number> {
    const activeStatus = [
      ESTATUS_DE_CONTRATO.ADJUDICADO,
      ESTATUS_DE_CONTRATO.LIBERADO,
      ESTATUS_DE_CONTRATO.PENDIENTE
    ];

    // Contar contratos activos por proveedor
    return await this.masterContractRepository.count({
      where: {
        estatusDeContrato: In(activeStatus),
        proveedor: { id: providerId }
      }
    });
  }

  async disableProvidersWithoutActiveContracts() {
    // Obtener todos los proveedores
    const allProviders = await this.providerRepository.find();

    for (const provider of allProviders) {
      const activeContractsCount = await this.countActiveContracts(provider.id);

      if (activeContractsCount == 0 && provider.estatus) {
        this.eventEmitter.emit("disable-provider", {
          providerId: provider.id
        });
      }
    }
  }


  // async uploadReports() {

  // }



  // async emitter(contratoMaestroId: string, evento: string) {
  //   this.eventEmitter.emit(
  //     `contrato.${evento}`,
  //     new ContratoEvent(contratoMaestroId),
  //   );
  // }

}

