import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateImpresionDto } from './dto/create-impresion.dto';
import { UpdateImpresionDto } from './dto/update-impresion.dto';
import { handleExeptions } from '../../helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Impresion } from './entities/impresion.entity';
import { Repository } from 'typeorm';
import { DimensionesService } from '../dimensiones/dimensiones.service';

@Injectable()
export class ImpresionesService {
  constructor(
    @InjectRepository(Impresion)
    private impresionRepository: Repository<Impresion>,
    private dimensionService: DimensionesService,
  ) { }

  async create(createImpresioneDto: CreateImpresionDto) {
    try {
      let dimension = null;
      const { dimensionesId, ...rest } = createImpresioneDto;
      if (dimensionesId) {
        dimension = await this.dimensionService.findOne(dimensionesId);
      }

      const impresion = this.impresionRepository.create({
        dimensionId: dimension,
        ...rest,
      });

      await this.impresionRepository.save(impresion);
      return impresion;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAll() {
    try {
      const impresiones = await this.impresionRepository.find({
        relations: {
          dimensionId: true,
        },
      });
      return impresiones;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const impresion = await this.impresionRepository.findOne({
        where: { id: id },
        relations: {
          dimensionId: true,
        },
      });
      if (!impresion)
        throw new NotFoundException('No se encuentra la medida de impresion');
      return impresion;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async update(id: string, updateImpresionDto: UpdateImpresionDto) {
    try {
      let dimension = null;
      const { dimensionesId, ...rest } = updateImpresionDto;

      const impresionDb = await this.findOne(id);

      if (dimensionesId) {
        dimension = await this.dimensionService.findOne(dimensionesId);
      }

      if (impresionDb) {
        await this.impresionRepository.update(id, {
          dimensionId: dimension,
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
      const impresion = await this.findOne(id);
      if (impresion) {
        await this.impresionRepository.delete({ id: id });
        return { message: 'medida de impresion eliminada correctamente' };
      }
    } catch (error) {
      handleExeptions(error);
    }
  }
}
