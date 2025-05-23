import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { Repository } from 'typeorm';
import { Municipio } from './entities/municipio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { handleExceptions } from '../../helpers/handleExceptions.function';

@Injectable()
export class MunicipioService {
  constructor(
    @InjectRepository(Municipio)
    private municipioRepository: Repository<Municipio>,
  ) { }

  async create(createMunicipioDto: CreateMunicipioDto) {
    try {
      const municipio = this.municipioRepository.create(createMunicipioDto);
      await this.municipioRepository.save(municipio);
      return municipio;
    } catch (error: any) {
      handleExceptions(error);
    }
  }

  async findAll() {
    try {
      const municipios = await this.municipioRepository.find();
      return municipios;
    } catch (error: any) {
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const municipio = await this.municipioRepository.findOne({
        where: { id: id },
      });
      if (!municipio) throw new NotFoundException('Municipio no encontrado');
      return municipio;
    } catch (error: any) {
      handleExceptions(error);
    }
  }

  async findEstatal() {
    try {
      const estatal = await this.municipioRepository.findOne({
        where: {
          nombre: 'ESTATAL'
        }
      });
      if (!estatal) throw new InternalServerErrorException('No hay estatus estatal');
      return estatal;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async update(id: string, updateMunicipioDto: UpdateMunicipioDto) {
    try {
      const municipio = await this.findOne(id);
      if (!municipio) throw new NotFoundException('Municipio no encontrado');
      await this.municipioRepository.update(id, updateMunicipioDto);
      return await this.municipioRepository.findOneBy({ id: id });
    } catch (error: any) {
      handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const municipio = await this.findOne(id);
      if (!municipio) throw new NotFoundException('Municipio no encontrado');
      await this.municipioRepository.delete(id);
      return { message: 'Municipio Eliminado con exito' };
    } catch (error: any) {
      handleExceptions(error);
    }
  }

  async esFrontera(id: string) {
    try {
      const municipio = await this.findOne(id);
      if (municipio.frontera) return { esfrontera: true };
      return { esfrontera: false };
    } catch (error: any) {
      handleExceptions(error);
    }
  }
}
