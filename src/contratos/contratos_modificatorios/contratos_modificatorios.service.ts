import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateContratoModificatorioDto } from './dto/create-contratos_modificatorio.dto';
import { UpdateContratoModificatorioDto } from './dto/update-contratos_modificatorio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContratoModificatorio } from './entities/contratos_modificatorio.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from '../../helpers/handleExceptions.function';
import { PaginationSetter } from '../../helpers/pagination.getter';
import { ESTATUS_DE_CONTRATO } from '../interfaces/estatus-de-contrato';
import { ContratosService } from '../contratos/contratos.service';

@Injectable()
export class ContratosModificatoriosService {
  constructor(
    @InjectRepository(ContratoModificatorio)
    private contratoModificatorioRepository: Repository<ContratoModificatorio>,
    private contratosService: ContratosService,
  ) {}

  async create(createContratoModificatorioDto: CreateContratoModificatorioDto) {
    try {
      let montoDisponible: number = 0.0;

      const { montoMinimoContratado, montoMaximoContratado, contratoId, ...rest } =
        createContratoModificatorioDto;
      const contratoMaestroDb = await this.contratosService.findOne(contratoId);

      if(montoMaximoContratado){
        montoDisponible = montoMaximoContratado;
      }
      
      montoDisponible = montoMinimoContratado;
      
      const contratoModificatorio = this.contratoModificatorioRepository.create(
        {
          montoDisponible: montoDisponible,
          montoMinimoContratado: montoMinimoContratado,
          montoMaximoContratado: montoMaximoContratado,
          contratoMaestro: contratoMaestroDb,
          ...rest,
        },
      );
      await this.contratoModificatorioRepository.save(contratoModificatorio);
      return contratoModificatorio;
    } catch (error) {
      handleExeptions(error);
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
      handleExeptions(error);
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
      handleExeptions(error);
    }
  }

  async update(
    id: string,
    updateContratoModificatorioDto: UpdateContratoModificatorioDto,
  ) {
    try {
      const contratoModificatorioDb = await this.findOne(id);
      const { estatusDeContrato } = contratoModificatorioDb;

      if (estatusDeContrato != ESTATUS_DE_CONTRATO.PENDIENTE) {
        throw new BadRequestException(
          'El contrato no se encuentra PENDIENTE. Cancelar Contrato',
        );
      } else {
        await this.contratoModificatorioRepository.update(
          id,
          updateContratoModificatorioDto,
        );
        return await this.findOne(id);
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try {
      const estatusDelContrato = await this.obtenerEstatus(id);
      if (estatusDelContrato.estatus != ESTATUS_DE_CONTRATO.PENDIENTE) {
        throw new BadRequestException(
          'El contrato no cuenta con estatus PENDIENTE. Cancelar Contrato',
        );
      } else {
        await this.contratoModificatorioRepository.delete({ id: id });
        return { message: 'contrato eliminado' };
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerEstatus(id: string) {
    try {
      const contratoModificatorio = await this.findOne(id);
      const estatusDeContrato = contratoModificatorio.estatusDeContrato;
      return { estatus: estatusDeContrato };
    } catch (error) {
      handleExeptions(error);
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
      handleExeptions(error);
    }
  }

  async desactivarCancelarContrato(
    id: string,
    updateContratoDto: UpdateContratoModificatorioDto,
  ) {
    const { estatusDeContrato } = updateContratoDto;
    try {
      const estatusDeContratoDb = await this.obtenerEstatus(id);
      if (estatusDeContratoDb.estatus === ESTATUS_DE_CONTRATO.LIBERADO) {
        await this.contratoModificatorioRepository.update(id, {
          estatusDeContrato: estatusDeContrato,
        });
        return { message: `Estatus de contrato ${estatusDeContrato}` };
      } else {
        throw new BadRequestException(
          'El contrato se debe encontraro LIBERADO para desactivarse o cancelarse',
        );
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async calcularIva() {}

  async actualizarMontos() {}
}
