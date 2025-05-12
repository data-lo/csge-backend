import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateContratoModificatorioDto } from './dto/create-contratos_modificatorio.dto';
import { UpdateContratoModificatorioDto } from './dto/update-contratos_modificatorio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContratoModificatorio } from './entities/contratos_modificatorio.entity';
import { Repository } from 'typeorm';
import { handleExceptions } from '../../helpers/handleExceptions.function';
import { PaginationSetter } from '../../helpers/pagination.getter';
import { ESTATUS_DE_CONTRATO } from '../interfaces/estatus-de-contrato';
import { ContratosService } from '../contratos/contratos.service';
import { Decimal } from 'decimal.js';
import { EXTENSION_TYPE_ENUM } from './enums/extension-type-enum';
import { addTimeToDate } from 'src/functions/add-time-to-date';
import { TIPO_DE_CONTRATO } from '../interfaces/tipo-de-contrato';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TYPE_EVENT_ORDER } from '../enums/type-event-order';
import { TIPO_DE_SERVICIO } from '../interfaces/tipo-de-servicio';
import { handlerAmounts } from '../contratos/functions/handler-amounts';
import { ContratoMaestro } from '../contratos/entities/contrato.maestro.entity';
import { Contrato } from '../contratos/entities/contrato.entity';
import { TYPE_EVENT_INVOICE } from 'src/ordenes/factura/enums/type-event-invoice';

@Injectable()
export class ContratosModificatoriosService {
  constructor(
    private eventEmitter: EventEmitter2,

    @InjectRepository(ContratoModificatorio)
    private amendmentContractRepository: Repository<ContratoModificatorio>,

    @InjectRepository(ContratoMaestro)
    private readonly masterContractRepository: Repository<ContratoMaestro>,

    @InjectRepository(Contrato)
    private readonly contractRepository: Repository<Contrato>,

    private contractsService: ContratosService,
  ) { }

  async create(createContratoModificatorioDto: CreateContratoModificatorioDto) {
    try {
      const {
        montoMinimoContratado,
        montoMaximoContratado,
        ivaMontoMaximoContratado,
        ivaMontoMinimoContratado,
        masterContractType,
        contratoId,
        extensionType,
        fechaFinal,
        fechaInicial,
        ...rest
      } = createContratoModificatorioDto;

      const masterContract = await this.contractsService.findOne(contratoId);

      if (!masterContract) {
        throw new BadRequestException(`¡El contrato principal con ID ${contratoId} no existe!`);
      }

      if (masterContract.estatusDeContrato === ESTATUS_DE_CONTRATO.CANCELADO) {
        throw new BadRequestException('¡El contrato principal fue cancelado! No se pueden crear contratos modificatorios!');
      }

      if (extensionType === EXTENSION_TYPE_ENUM.AMOUNTS || extensionType === EXTENSION_TYPE_ENUM.BOTH) {
        if (masterContractType === TIPO_DE_CONTRATO.CERRADO) {
          if (!montoMaximoContratado || !ivaMontoMaximoContratado) {
            throw new BadRequestException('¡Se deben incluir montos válidos para realizar una extensión de contrato por montos!');
          }
        }
        else {
          if (!montoMaximoContratado || !montoMinimoContratado || !ivaMontoMaximoContratado || !ivaMontoMinimoContratado) {
            throw new BadRequestException('¡Se deben incluir montos válidos para realizar una extensión de contrato por montos!');
          }
        }
      }

      if (extensionType === EXTENSION_TYPE_ENUM.TIME || extensionType === EXTENSION_TYPE_ENUM.BOTH) {
        if (!fechaFinal || !fechaInicial) {
          throw new BadRequestException('¡Se deben incluir fechas válidas para realizar una extensión de contrato por tiempo!');
        }
      }

      const maxAmount = new Decimal(montoMaximoContratado || 0);
      const maxIva = new Decimal(ivaMontoMaximoContratado || 0);
      const minAmount = new Decimal(montoMinimoContratado || 0);
      const minIva = new Decimal(ivaMontoMinimoContratado || 0);

      const availableAmount = maxAmount.plus(maxIva);
      const committedAmount = new Decimal(0);
      const activeAmount = new Decimal(0);
      const executedAmount = new Decimal(0);
      const paidAmount = new Decimal(0);

      const contratoModificatorio = this.amendmentContractRepository.create({
        montoDisponible: availableAmount.toNumber(),
        montoMinimoContratado: minAmount.toNumber(),
        montoMaximoContratado: maxAmount.toNumber(),
        ivaMontoMaximoContratado: maxIva.toNumber(),
        ivaMontoMinimoContratado: minIva.toNumber(),
        extensionType: extensionType,
        contractType: masterContractType,
        contratoMaestro: masterContract,
        committedAmount: committedAmount.toNumber(),
        montoActivo: activeAmount.toNumber(),
        montoEjercido: executedAmount.toNumber(),
        montoPagado: paidAmount.toNumber(),
        fechaFinal: ((extensionType === EXTENSION_TYPE_ENUM.TIME || extensionType === EXTENSION_TYPE_ENUM.BOTH) && fechaFinal) ? addTimeToDate(fechaFinal) : undefined,
        fechaInicial: ((extensionType === EXTENSION_TYPE_ENUM.TIME || extensionType === EXTENSION_TYPE_ENUM.BOTH) && fechaInicial) ? addTimeToDate(fechaInicial, 0, 0) : undefined,
        ...rest,
      });

      await this.amendmentContractRepository.save(contratoModificatorio);

      if (masterContract.estatusDeContrato === ESTATUS_DE_CONTRATO.TERMINADO && extensionType === EXTENSION_TYPE_ENUM.TIME) {
        const activeContractsCount = await this.contractsService.countActiveContracts(masterContract.proveedor.id);

        const typeServices = await this.contractsService.getServiceTypesByContractMaster(masterContract.id);

        await this.contractsService.changeStatus(masterContract.id, ESTATUS_DE_CONTRATO.ADJUDICADO);

        if (activeContractsCount === 0 && !masterContract.proveedor.estatus) {
          this.eventEmitter.emit("enable-provider", {
            providerId: masterContract.proveedor.id
          });

          this.eventEmitter.emit("enable-stations", {
            providerId: masterContract.proveedor.id,
            typeServices: typeServices
          });

        } else {
          this.eventEmitter.emit("enable-stations", {
            providerId: masterContract.proveedor.id,
            typeServices: typeServices
          });
        }
      }


      return contratoModificatorio;

    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAll(page: number) {
    try {
      const paginationSetter = new PaginationSetter();
      const contratosModificatorios = this.amendmentContractRepository.find(
        {
          skip: paginationSetter.getSkipElements(page),
          take: paginationSetter.castPaginationLimit(),
        },
      );
      return contratosModificatorios;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const contratoModificatorio = await this.amendmentContractRepository.findOneBy({ id: id });

      if (!contratoModificatorio) {
        throw new BadRequestException('El contrato modificatorio no existe');
      }

      return contratoModificatorio;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async update(modificatoryContractId: string, updateContratoModificatorioDto: UpdateContratoModificatorioDto,
  ) {
    const validStatus = [
      ESTATUS_DE_CONTRATO.PENDIENTE,
      ESTATUS_DE_CONTRATO.ADJUDICADO,
      ESTATUS_DE_CONTRATO.LIBERADO
    ];

    try {
      const contratoModificatorioDb = await this.findOne(modificatoryContractId);

      const { estatusDeContrato } = contratoModificatorioDb;

      if (!validStatus.includes(estatusDeContrato)) {

        throw new BadRequestException('¡El contrato no tiene un estatus válido para poder ser cancelado!');

      } else {

        await this.amendmentContractRepository.update(modificatoryContractId, updateContratoModificatorioDto);

        return await this.findOne(modificatoryContractId);
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async remove(contractAmendmentId: string) {
    try {
      const contractAmendment = await this.amendmentContractRepository.findOne({
        where: { id: contractAmendmentId },
        relations: ['contratoMaestro']
      })

      if (contractAmendment.estatusDeContrato != ESTATUS_DE_CONTRATO.PENDIENTE) {
        throw new BadRequestException('¡Solo se pueden cancelar contratos con estatus "Pendiente"!');
      } else {
        await this.amendmentContractRepository.delete({ id: contractAmendmentId });
      }

      if (contractAmendment.extensionType === EXTENSION_TYPE_ENUM.TIME) {
        const masterContract = await this.contractsService.findOne(contractAmendment.contratoMaestro.id);

        const activeContractsCount = await this.contractsService.countActiveContracts(masterContract.proveedor.id);

        const typeServices = await this.contractsService.getServiceTypesByContractMaster(masterContract.id);

        if (activeContractsCount === 1 && masterContract.proveedor.estatus) {
          await this.contractsService.changeStatus(masterContract.id, ESTATUS_DE_CONTRATO.TERMINADO);

          this.eventEmitter.emit("disable-provider", {
            providerId: masterContract.proveedor.id
          });
        }

        this.eventEmitter.emit("disable-stations", {
          providerId: masterContract.proveedor.id,
          typeServices: typeServices
        });

      }
    }
    catch (error) {
      handleExceptions(error);
    }
  }

  async getStatus(contractAmendmentId: string) {
    try {
      const contractAmendment = await this.findOne(contractAmendmentId);

      const estatusDeContrato = contractAmendment.estatusDeContrato;

      return { status: estatusDeContrato };

    } catch (error) {
      handleExceptions(error);
    }
  }

  async modificarEstatus(
    id: string,
    updateContratoModificatorioDto: UpdateContratoModificatorioDto,
  ) {
    try {
      const { estatusDeContrato } = updateContratoModificatorioDto;
      await this.amendmentContractRepository.update(id, {
        estatusDeContrato: estatusDeContrato,
      });
      return {
        message: `Estatus de contrato actuzalizado a ${estatusDeContrato}`,
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async cancellContract(contractAmendmentId: string, updateContratoDto: UpdateContratoModificatorioDto,) {

    try {
      const { cancellationReason } = updateContratoDto

      const contractAmendment = await this.amendmentContractRepository.findOne({
        where: { id: contractAmendmentId },
        relations: ['contratoMaestro']
      });

      const validStatus = [
        ESTATUS_DE_CONTRATO.ADJUDICADO,
        ESTATUS_DE_CONTRATO.LIBERADO
      ];

      if (validStatus.includes(contractAmendment.estatusDeContrato)) {

        await this.amendmentContractRepository.update(contractAmendmentId, {
          estatusDeContrato: ESTATUS_DE_CONTRATO.CANCELADO,
          cancellationReason: cancellationReason
        });

        if (contractAmendment.extensionType === EXTENSION_TYPE_ENUM.TIME) {
          const masterContract = await this.contractsService.findOne(contractAmendment.contratoMaestro.id);

          const activeContractsCount = await this.contractsService.countActiveContracts(masterContract.proveedor.id);

          const typeServices = await this.contractsService.getServiceTypesByContractMaster(masterContract.id);

          if (activeContractsCount === 1 && masterContract.proveedor.estatus) {
            await this.contractsService.changeStatus(masterContract.id, ESTATUS_DE_CONTRATO.TERMINADO);

            this.eventEmitter.emit("disable-provider", {
              providerId: masterContract.proveedor.id
            });
          }

          this.eventEmitter.emit("disable-stations", {
            providerId: masterContract.proveedor.id,
            typeServices: typeServices
          });

        }

        return { message: '¡El contrato ha sido cancelado exitosamente!' };

      } else {
        throw new BadRequestException('¡El contrato debe estar en Adjudicado o Liberado para poder cancelarse!',);
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async updateAmendmentContractAmountByOrder(totalOrder: string, serviceType: TIPO_DE_SERVICIO, amendmentContractId: string, eventType: TYPE_EVENT_ORDER | TYPE_EVENT_INVOICE) {

    const masterContract = await this.masterContractRepository.findOne({
      where: { contratosModificatorios: { id: amendmentContractId } },
      relations: { contratos: true },
    });

    const contractByServiceType = masterContract.contratos.find(contract => contract.tipoDeServicio === serviceType);

    const amendmentContract = await this.amendmentContractRepository.findOne({
      where: { id: amendmentContractId },
    });

    const values = {
      contract: {
        availableAmount: amendmentContract.montoDisponible,
        paidAmount: amendmentContract.montoPagado,
        executedAmount: amendmentContract.montoEjercido,
        activeAmount: amendmentContract.montoActivo,
        committedAmount: amendmentContract.committedAmount
      },
      contractByServiceType: {
        paidAmount: contractByServiceType.montoPagado,
        executedAmount: contractByServiceType.montoEjercido,
        activeAmount: contractByServiceType.montoActivo
      },
      eventType: eventType,
      totalOrder: totalOrder
    }

    const updatedValues = handlerAmounts(values);

    if (eventType === TYPE_EVENT_ORDER.ORDER_APPROVED || eventType === TYPE_EVENT_ORDER.ORDER_CANCELLED) {

      await this.contractRepository.update(contractByServiceType.id, {
        montoActivo: updatedValues.contractByServiceType.activeAmount
      });

      await this.amendmentContractRepository.update(amendmentContract.id, {
        montoDisponible: updatedValues.contract.availableAmount,
        montoActivo: updatedValues.contract.activeAmount,
        committedAmount: updatedValues.contract.committedAmount
      });

    } else if (eventType === TYPE_EVENT_INVOICE.INVOICE_REVIEWED || eventType === TYPE_EVENT_INVOICE.INVOICE_CANCELLED) {

      await this.contractRepository.update(contractByServiceType.id, {
        montoActivo: updatedValues.contractByServiceType.activeAmount,
        montoEjercido: updatedValues.contractByServiceType.executedAmount
      });

      await this.amendmentContractRepository.update(amendmentContract.id, {
        montoEjercido: updatedValues.contract.executedAmount,
        montoActivo: updatedValues.contract.activeAmount
      });
    } else if (eventType === TYPE_EVENT_INVOICE.INVOICE_PAID) {

      await this.contractRepository.update(contractByServiceType.id, {
        montoPagado: updatedValues.contractByServiceType.paidAmount,
        montoEjercido: updatedValues.contractByServiceType.executedAmount
      });

      await this.amendmentContractRepository.update(amendmentContract.id, {
        montoPagado: updatedValues.contract.paidAmount,
        montoEjercido: updatedValues.contract.executedAmount
      });
    }
  }

}
