import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { Contrato } from './entities/contrato.entity';
import { ILike, In, LessThan, LessThanOrEqual, Repository } from 'typeorm';
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
import { TIPO_DE_SERVICIO } from '../interfaces/tipo-de-servicio';
import { Decimal } from 'decimal.js'
import { ContratoModificatorio } from '../contratos_modificatorios/entities/contratos_modificatorio.entity';
import { EXTENSION_TYPE_ENUM } from '../contratos_modificatorios/enums/extension-type-enum';
import { addTimeToDate } from 'src/functions/add-time-to-date';
import { getResolvedYear } from 'src/helpers/get-resolved-year';


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

    @InjectRepository(ContratoModificatorio)
    private readonly contractAmendmentRepository: Repository<ContratoModificatorio>,

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
        fechaFinal,
        fechaInicial,
        ...rest
      } = createContratoDto;

      const date = new Date();

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

      const hasDuplicateServices = await this.verifyServiceExistsOnce(provider.id, tipoDeServicios);

      if (hasDuplicateServices) {
        throw new ConflictException('¡Algunos servicios ya están asociados a un contrato vigente!');
      }

      const activeContractsCount = await this.countActiveContracts(provider.id);

      const availableFunds = montoMaximoContratado + ivaMontoMaximoContratado;

      const masterContract = this.masterContractRepository.create({
        ivaMontoMaximoContratado,
        ivaMontoMinimoContratado,
        montoMinimoContratado,
        montoMaximoContratado,
        montoDisponible: availableFunds,
        proveedor: provider,
        numeroDeContrato: numeroDeContrato,
        fechaFinal: addTimeToDate(fechaFinal),
        fechaInicial: addTimeToDate(fechaInicial, 0, 0),
        ...rest,
      });

      if (activeContractsCount === 0 && !provider.estatus) {
        this.eventEmitter.emit("enable-provider", {
          providerId: provider.id
        });

        this.eventEmitter.emit("enable-stations", {
          providerId: provider.id,
          typeServices: tipoDeServicios
        });

      } else {
        this.eventEmitter.emit("enable-stations", {
          providerId: provider.id,
          typeServices: tipoDeServicios
        });
      }

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

        this.eventEmitter.emit("disable-provider", {
          providerId: provider.id
        });

        throw new InternalServerErrorException('¡Error al crear los contratos secundarios!');
      }

      return masterContract;
    } catch (error) {
      handleExceptions(error);
    }
  }


  async findAll(pagina: number) {
    try {
      const currentYear = new Date().getFullYear();
      const paginationSetter = new PaginationSetter();

      const masterContracts = await this.masterContractRepository
        .createQueryBuilder('contratoMaestro')
        .leftJoinAndSelect('contratoMaestro.proveedor', 'proveedor')
        .leftJoinAndSelect('contratoMaestro.contratos', 'contratos')
        .leftJoinAndSelect('contratoMaestro.contratosModificatorios', 'contratosModificatorios')
        .select([
          'contratoMaestro.id',
          'contratoMaestro.numeroDeContrato',
          'contratoMaestro.tipoDeContrato',
          'contratoMaestro.montoActivo',
          'contratoMaestro.montoEjercido',
          'contratoMaestro.montoPagado',
          'contratoMaestro.montoDisponible',
          'contratoMaestro.committedAmount',
          'contratoMaestro.estatusDeContrato',

          'contratos.id',
          'contratos.tipoDeServicio',
          'proveedor.razonSocial',

          'contratosModificatorios.id',
          'contratosModificatorios.committedAmount',
          'contratosModificatorios.estatusDeContrato',
          'contratosModificatorios.montoActivo',
          'contratosModificatorios.montoEjercido',
          'contratosModificatorios.montoPagado',
          'contratosModificatorios.montoDisponible',
        ])
        .where("EXTRACT(YEAR FROM contratoMaestro.creadoEn) = :year", { year: currentYear })
        .skip(paginationSetter.getSkipElements(pagina))
        .take(paginationSetter.castPaginationLimit())
        .getMany();

      for (const masterContract of masterContracts) {
        let globalActiveAmount = new Decimal(masterContract.montoActivo || 0);
        let globalExecutedAmount = new Decimal(masterContract.montoEjercido || 0);
        let globalPaidAmount = new Decimal(masterContract.montoPagado || 0);
        let globalAvailableAmount = new Decimal(masterContract.montoDisponible || 0);
        let globalCommittedAmount = new Decimal(masterContract.committedAmount || 0);

        if (masterContract.contratosModificatorios) {
          for (const modificatoryContract of masterContract.contratosModificatorios) {
            const isValid =
              modificatoryContract.estatusDeContrato !== ESTATUS_DE_CONTRATO.CANCELADO &&
              modificatoryContract.extensionType === EXTENSION_TYPE_ENUM.AMOUNTS;

            if (isValid) {
              globalActiveAmount = globalActiveAmount.plus(modificatoryContract.montoActivo || 0);
              globalExecutedAmount = globalExecutedAmount.plus(modificatoryContract.montoEjercido || 0);
              globalPaidAmount = globalPaidAmount.plus(modificatoryContract.montoPagado || 0);
              globalAvailableAmount = globalAvailableAmount.plus(modificatoryContract.montoDisponible || 0);
            }
          }
        }

        (masterContract as any).globalAmounts = {
          active: globalActiveAmount.toNumber(),
          executed: globalExecutedAmount.toNumber(),
          paid: globalPaidAmount.toNumber(),
          available: globalAvailableAmount.toNumber(),
          committed: globalCommittedAmount.toNumber(),
        };
      }

      return masterContracts;
    } catch (error) {
      handleExceptions(error);
    }
  }


  async getContractsWithFilters(canAccessHistory = false, parameters?: string, year?: string, status?: ESTATUS_DE_CONTRATO) {

    const resolvedYear = getResolvedYear(year, canAccessHistory);

    try {
      const query = this.masterContractRepository
        .createQueryBuilder('contratoMaestro')
        .leftJoinAndSelect('contratoMaestro.proveedor', 'proveedor')
        .leftJoinAndSelect('contratoMaestro.contratos', 'contratos')
        .leftJoinAndSelect('contratoMaestro.contratosModificatorios', 'contratosModificatorios')
        .select([
          'contratoMaestro.id',
          'contratoMaestro.numeroDeContrato',
          'contratoMaestro.tipoDeContrato',
          'contratoMaestro.montoActivo',
          'contratoMaestro.montoEjercido',
          'contratoMaestro.montoPagado',
          'contratoMaestro.montoDisponible',
          'contratoMaestro.committedAmount',
          'contratoMaestro.estatusDeContrato',
          'contratos.id',
          'contratos.tipoDeServicio',
          'proveedor.razonSocial',
          'proveedor.rfc',
          'contratosModificatorios.id',
          'contratosModificatorios.committedAmount',
          'contratosModificatorios.estatusDeContrato',
          'contratosModificatorios.montoActivo',
          'contratosModificatorios.montoEjercido',
          'contratosModificatorios.montoPagado',
          'contratosModificatorios.montoDisponible',
        ]);

      if (parameters) {
        query.andWhere(
          `(contratoMaestro.numeroDeContrato ILIKE :search OR proveedor.rfc ILIKE :search)`,
          { search: `%${parameters}%` }
        );
      }

      if (status) {
        query.andWhere('contratoMaestro.estatusDeContrato = :status', { status });
      }


      // Filtro por año resuelto (ya sea el actual o el proporcionado con permiso)
      if (resolvedYear) {
        query.andWhere("EXTRACT(YEAR FROM contratoMaestro.creadoEn) = :year", {
          year: resolvedYear,
        });

      }
      const masterContracts = await query.getMany();

      masterContracts.forEach((masterContract) => {
        const {
          montoActivo = 0,
          montoEjercido = 0,
          montoPagado = 0,
          montoDisponible = 0,
          committedAmount = 0,
          contratosModificatorios = [],
        } = masterContract;

        let globalActiveAmount = new Decimal(montoActivo);
        let globalExecutedAmount = new Decimal(montoEjercido);
        let globalPaidAmount = new Decimal(montoPagado);
        let globalAvailableAmount = new Decimal(montoDisponible);
        let globalCommittedAmount = new Decimal(committedAmount);

        contratosModificatorios.forEach((modificatoryContract) => {
          const isValid =
            modificatoryContract.estatusDeContrato !== ESTATUS_DE_CONTRATO.CANCELADO &&
            modificatoryContract.extensionType === EXTENSION_TYPE_ENUM.AMOUNTS;

          if (isValid) {
            globalActiveAmount = globalActiveAmount.plus(modificatoryContract.montoActivo || 0);
            globalExecutedAmount = globalExecutedAmount.plus(modificatoryContract.montoEjercido || 0);
            globalPaidAmount = globalPaidAmount.plus(modificatoryContract.montoPagado || 0);
            globalAvailableAmount = globalAvailableAmount.plus(modificatoryContract.montoDisponible || 0);
          }
        });

        (masterContract as any).globalAmounts = {
          active: globalActiveAmount.toNumber(),
          executed: globalExecutedAmount.toNumber(),
          paid: globalPaidAmount.toNumber(),
          available: globalAvailableAmount.toNumber(),
          committed: globalCommittedAmount.toNumber(),
        };
      });

      return masterContracts;
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

  async findOne(masterContractId: string) {
    try {
      const masterContract = await this.masterContractRepository.findOne({
        where: { id: masterContractId },
        relations: {
          contratos: true,
          proveedor: true,
          contratosModificatorios: true,
        },
      });

      if (!masterContract) {
        throw new NotFoundException(`¡El contrato con ID '${masterContractId}' no se encuentra!`);

      }

      return masterContract;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async getContractStatus(id: string) {
    try {
      const contrato = await this.masterContractRepository.findOne({
        where: { id },
        select: { estatusDeContrato: true },
      });

      if (!contrato) {
        throw new NotFoundException(`¡Contrato con ID ${id} no encontrado!`);
      }

      return { status: contrato.estatusDeContrato };

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


  async changeStatus(contractMasterId: string, newStatus: ESTATUS_DE_CONTRATO) {
    try {

      const masterContract = await this.masterContractRepository.findOne({
        where: { id: contractMasterId },
      });

      masterContract.estatusDeContrato = newStatus;

      await this.masterContractRepository.save(masterContract);

      return { message: `¡Estatus del contrato actualizado exitosamente!` };

    } catch (error) {
      handleExceptions(error);
    }
  }

  async update(masterContractId: string, updateContratoDto: UpdateContratoDto) {
    try {

      const { estatusDeContrato, linkContrato } = updateContratoDto

      const masterContract = await this.masterContractRepository.findOne({
        where: { id: masterContractId },
      });

      if (!masterContract) {
        throw new NotFoundException(`¡El contrato con ID '${masterContract.id}' no se encuentra!`);
      }

      const validStatus = [
        ESTATUS_DE_CONTRATO.PENDIENTE,
        ESTATUS_DE_CONTRATO.ADJUDICADO,
        ESTATUS_DE_CONTRATO.LIBERADO
      ];

      if (!validStatus.includes(masterContract.estatusDeContrato)) {
        throw new BadRequestException("¡El contrato debe estar en estatus 'Adjudicado' o 'Pendiente' para poder ser modificado!");
      }

      await this.masterContractRepository.update(masterContractId, {
        estatusDeContrato: estatusDeContrato,
        linkContrato: linkContrato
      });

      return { message: 'contrato actualizado con exito' };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async remove(masterContractId: string) {
    try {

      const masterContract = await this.masterContractRepository.findOne({
        where: { id: masterContractId },
        relations: ["contratos", "proveedor"],
      });

      if (masterContract.estatusDeContrato !== ESTATUS_DE_CONTRATO.PENDIENTE) {
        throw new BadRequestException(
          "¡El contrato debe estar en estatus 'Pendiente' poder eliminarse!"
        );
      }

      if (masterContract) {
        const serviceTypeContracted = masterContract.contratos.map(contract => contract.tipoDeServicio);

        this.eventEmitter.emit("disable-stations", {
          providerId: masterContract.proveedor.id,
          typeServices: serviceTypeContracted,
        });
      }

      for (const contract of masterContract.contratos) {
        const contractEntity = await this.contractRepository.findOne({ where: { id: contract.id } });

        await this.contractRepository.remove(contractEntity);
      }

      await this.masterContractRepository.remove(masterContract);

      return {
        message: "¡El contrato ha sido eliminado exitosamente!",
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async processContractCancellation(masterContractId: string, updateContratoDto: UpdateContratoDto) {
    const { estatusDeContrato, cancellationReason } = updateContratoDto;

    try {
      const contract = await this.getContractStatus(masterContractId);

      const validStates = [
        ESTATUS_DE_CONTRATO.LIBERADO,
        ESTATUS_DE_CONTRATO.ADJUDICADO,
      ];

      if (!validStates.includes(contract.status)) {

        throw new BadRequestException(
          "¡El contrato debe estar en estatus 'Liberado' o 'Adjudicado' para poder cancelarse!"
        );
      }

      const modificatoryContracts = await this.contractAmendmentRepository.find({
        where: [
          {
            contratoMaestro: { id: masterContractId },
            estatusDeContrato: ESTATUS_DE_CONTRATO.LIBERADO,
          },
          {
            contratoMaestro: { id: masterContractId },
            estatusDeContrato: ESTATUS_DE_CONTRATO.ADJUDICADO,
          },
          {
            contratoMaestro: { id: masterContractId },
            estatusDeContrato: ESTATUS_DE_CONTRATO.PENDIENTE
          }
        ]
      });

      if (modificatoryContracts.length > 0) {
        for (const modificatoryContract of modificatoryContracts) {
          await this.contractAmendmentRepository.update(modificatoryContract.id, {
            estatusDeContrato: ESTATUS_DE_CONTRATO.CANCELADO,
            cancellationReason: "EL CONTRATO PRINCIPAL FUE CANCELADO.",
          });
        }
      }

      await this.masterContractRepository.update(masterContractId, {
        estatusDeContrato: ESTATUS_DE_CONTRATO.CANCELADO,
        cancellationReason: cancellationReason,
      });

      if (estatusDeContrato === ESTATUS_DE_CONTRATO.CANCELADO) {
        const masterContract = await this.masterContractRepository.findOne({
          where: { id: masterContractId },
          relations: ["contratos", "proveedor"],
        });

        if (masterContract) {
          const serviceTypeContracted = masterContract.contratos.map(contract => contract.tipoDeServicio);

          this.eventEmitter.emit("disable-stations", {
            providerId: masterContract.proveedor.id,
            typeServices: serviceTypeContracted,
          });
        }
      }

      return {
        message: "¡El contrato ha sido cancelado exitosamente!",
      };

    } catch (error) {
      handleExceptions(error);
      throw error;
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
        activeAmount: masterContract.montoActivo,
        committedAmount: masterContract.committedAmount
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
        montoActivo: updatedValues.masterContract.activeAmount,
        committedAmount: updatedValues.masterContract.committedAmount
      });

    } else if (eventType === TYPE_EVENT_INVOICE.INVOICE_REVIEWED || eventType === TYPE_EVENT_INVOICE.INVOICE_CANCELLED) {

      await this.contractRepository.update(contractByServiceType.id, {
        montoActivo: updatedValues.contractByServiceType.activeAmount,
        montoEjercido: updatedValues.contractByServiceType.executedAmount
      });

      await this.masterContractRepository.update(masterContract.id, {
        montoEjercido: updatedValues.masterContract.executedAmount,
        montoActivo: updatedValues.masterContract.activeAmount
      });
    } else if (eventType === TYPE_EVENT_INVOICE.INVOICE_PAID) {

      await this.contractRepository.update(contractByServiceType.id, {
        montoPagado: updatedValues.contractByServiceType.paidAmount,
        montoEjercido: updatedValues.contractByServiceType.executedAmount
      });

      await this.masterContractRepository.update(masterContract.id, {
        montoPagado: updatedValues.masterContract.paidAmount,
        montoEjercido: updatedValues.masterContract.executedAmount
      });
    }
  }

  async checkContractsExpiration() {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // Obtener contratos que finalizan hoy con sus relaciones
    const masterContractsEndsToday = await this.masterContractRepository.find({
      where: { fechaFinal: LessThan(today) },
      relations: ["contratos", "proveedor", "contratosModificatorios"]
    });

    const contractsByProvider: Record<string, ContratoMaestro[]> = {};

    // Agrupar los contratos maestro por proveedor
    for (const masterContract of masterContractsEndsToday) {
      const providerId = masterContract.proveedor.id;

      if (!contractsByProvider[providerId]) {
        contractsByProvider[providerId] = [];
      }

      const modificatoryContracts = masterContract.contratosModificatorios
        .filter(contract => contract.extensionType === EXTENSION_TYPE_ENUM.TIME)
        .sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime());

      const lastModificatory = modificatoryContracts[modificatoryContracts.length - 1];

      if (!lastModificatory || new Date(lastModificatory.fechaFinal).getTime() < today.getTime()) {
        console.log("Se desactiva hoy el contrato modificatorio.");
        console.log(lastModificatory);
        contractsByProvider[providerId].push(masterContract);
      }
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

  async verifyServiceExistsOnce(providerId: string, typeServices: TIPO_DE_SERVICIO[]) {
    const validStates = [
      ESTATUS_DE_CONTRATO.PENDIENTE,
      ESTATUS_DE_CONTRATO.ADJUDICADO,
      ESTATUS_DE_CONTRATO.LIBERADO
    ];

    const masterContracts = await this.masterContractRepository.find({
      where: {
        proveedor: { id: providerId },
        estatusDeContrato: In(validStates)
      },
      relations: ["contratos"]
    });

    const servicesTypeActive: TIPO_DE_SERVICIO[] = masterContracts.flatMap(masterContract =>
      masterContract.contratos.map(contract => contract.tipoDeServicio)
    );

    return typeServices.some(service => servicesTypeActive.includes(service));
  }

  async getServiceTypesByContractMaster(masterContractId: string) {
    const masterContracts = await this.masterContractRepository.find({
      where: { id: masterContractId },
      relations: ["contratos"]
    });

    const servicesTypeActive: TIPO_DE_SERVICIO[] = masterContracts.flatMap(masterContract =>
      masterContract.contratos.map(contract => contract.tipoDeServicio)
    );

    return servicesTypeActive

  }
}

