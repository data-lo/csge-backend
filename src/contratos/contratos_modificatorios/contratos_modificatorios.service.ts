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

@Injectable()
export class ContratosModificatoriosService {
  constructor(
    @InjectRepository(ContratoModificatorio)
    private contratoModificatorioRepository: Repository<ContratoModificatorio>,
    private contratosService: ContratosService,
  ) { }

  async create(createContratoModificatorioDto: CreateContratoModificatorioDto) {
    try {
      const {
        montoMinimoContratado,
        montoMaximoContratado,
        ivaMontoMaximoContratado,
        ivaMontoMinimoContratado,
        contratoId,
        ...rest
      } = createContratoModificatorioDto;

      const masterContract = await this.contratosService.findOne(contratoId);

      if (!masterContract) {
        throw new BadRequestException(`El contrato principal con ID ${contratoId} no existe.`);
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

      const contratoModificatorio = this.contratoModificatorioRepository.create({
        montoDisponible: availableAmount.toNumber(),
        montoMinimoContratado: minAmount.toNumber(),
        montoMaximoContratado: maxAmount.toNumber(),
        ivaMontoMaximoContratado: maxIva.toNumber(),
        ivaMontoMinimoContratado: minIva.toNumber(),
        contratoMaestro: masterContract,
        committedAmount: committedAmount.toNumber(),
        montoActivo: activeAmount.toNumber(),
        montoEjercido: executedAmount.toNumber(),
        montoPagado: paidAmount.toNumber(),
        ...rest,
      });

      await this.contratoModificatorioRepository.save(contratoModificatorio);
      return contratoModificatorio;

    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAll(page: number) {
    try {
      const paginationSetter = new PaginationSetter();
      const contratosModificatorios = this.contratoModificatorioRepository.find(
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
      const contratoModificatorio =
        await this.contratoModificatorioRepository.findOneBy({ id: id });
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

        await this.contratoModificatorioRepository.update(modificatoryContractId, updateContratoModificatorioDto);

        return await this.findOne(modificatoryContractId);
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const estatusDelContrato = await this.obtenerEstatus(id);
      if (estatusDelContrato.status != ESTATUS_DE_CONTRATO.PENDIENTE) {
        throw new BadRequestException(
          'El contrato no cuenta con estatus PENDIENTE. Cancelar Contrato',
        );
      } else {
        await this.contratoModificatorioRepository.delete({ id: id });
        return { message: 'contrato eliminado' };
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerEstatus(id: string) {
    try {
      const contratoModificatorio = await this.findOne(id);
      const estatusDeContrato = contratoModificatorio.estatusDeContrato;
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
      await this.contratoModificatorioRepository.update(id, {
        estatusDeContrato: estatusDeContrato,
      });
      return {
        message: `Estatus de contrato actuzalizado a ${estatusDeContrato}`,
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async cancellContract(id: string, updateContratoDto: UpdateContratoModificatorioDto,) {

    console.log("Ok")
    try {
      const { cancellationReason } = updateContratoDto

      const status = await this.obtenerEstatus(id);

      const validStatus = [
        ESTATUS_DE_CONTRATO.ADJUDICADO,
        ESTATUS_DE_CONTRATO.LIBERADO
      ]

      if (validStatus.includes(status.status)) {

        await this.contratoModificatorioRepository.update(id, {
          estatusDeContrato: ESTATUS_DE_CONTRATO.CANCELADO,
          cancellationReason: cancellationReason
        });

        return { message: '¡El contrato ha sido cancelado exitosamente!' };

      } else {
        throw new BadRequestException('¡El contrato debe estar en Adjudicado o Liberado para poder cancelarse!',);
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async calcularIva() { }

  async actualizarMontos() { }
}
