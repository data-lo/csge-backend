import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIvaDto } from './dto/create-iva.dto';
import { UpdateIvaDto } from './dto/update-iva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Iva } from './entities/iva.entity';
import { Repository } from 'typeorm';
import { handleExceptions } from '../../helpers/handleExceptions.function';
import { Territorio } from './interfaces/territorios';

@Injectable()
export class IvaService {

  constructor(
    @InjectRepository(Iva)
    private taxRepository: Repository<Iva>
  ) { }


  async create(createIvaDto: CreateIvaDto) {
    try {
      const iva = this.taxRepository.create(createIvaDto);
      await this.taxRepository.save(iva);
      return {
        "id": iva.id,
        "porcentaje": (iva.porcentaje * 100),
        "territorio": iva.territorio
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAll() {
    try {
      let ivas = await this.taxRepository.find();
      ivas.forEach(iva => {
        iva.porcentaje = (iva.porcentaje * 100)
      });
      return ivas;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const iva = await this.taxRepository.findOneBy({ id: id });
      if (iva) {
        return {
          "id": iva.id,
          "porcentaje": (iva.porcentaje * 100),
          "territorio": iva.territorio
        };
      }
      throw new NotFoundException('El Iva no existe');
    } catch (error) {
      handleExceptions(error);
    }
  }

  async update(taxId: string, values: UpdateIvaDto) {
    try {
      const tax = await this.findOne(taxId);

      if (!tax) {
        throw new NotFoundException(`¡No se encontró el IVA con ID '${taxId}'!`);
      }

      await this.taxRepository.update(taxId, {
        porcentaje: values.porcentaje
      });
    
      return this.findOne(taxId);
      
    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerIvaNacional() {
    try {
      let iva = await this.taxRepository.findOneBy({ territorio: Territorio.NACIONAL })
      return {
        "id": iva.id,
        "porcentaje": (iva.porcentaje * 100),
        "territorio": iva.territorio
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerIvaFrontera() {
    try {
      let iva = await this.taxRepository.findOneBy({ territorio: Territorio.FRONTERA })
      return {
        "id": iva.id,
        "porcentaje": (iva.porcentaje * 100),
        "territorio": iva.territorio
      }
    } catch (error) {
      handleExceptions(error);
    }
  }
}
