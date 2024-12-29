import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { Puesto } from './entities/puesto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { handleExeptions } from '../../helpers/handleExceptions.function';

@Injectable()
export class PuestosService {
  constructor(
    @InjectRepository(Puesto)
    private puestoRepository: Repository<Puesto>,
  ) {}

  async create(createPuestoDto: CreatePuestoDto) {
    try {
      const puesto = this.puestoRepository.create(createPuestoDto);
      await this.puestoRepository.save(puesto);
      return puesto;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAll() {
    try {
      return await this.puestoRepository.find();
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const puesto = await this.puestoRepository.findOneBy({ id: id });
      if (!puesto) throw new NotFoundException('Puesto no encontrado');
      return puesto;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findByTerm(term: string) {
    try {
      const puesto = await this.puestoRepository.findOneBy({ nombre: term });
      if (!puesto) {
        throw new NotFoundException('NO SE ENCUENTRA EL PUESTO');
      }
      return puesto;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async update(id: string, updatePuestoDto: UpdatePuestoDto) {
    try {
      const puestoDb = await this.puestoRepository.findOneBy({
        id: id,
      });
      if (!puestoDb) throw new NotFoundException('NO SE ENCUENTRA EL PUESTO');

      Object.assign(puestoDb, updatePuestoDto);
      const puestoUpdated = await this.puestoRepository.save(puestoDb);
      if (!puestoUpdated) throw new InternalServerErrorException('ERROR AL ACTUALIZR EL PUESTO');
      return puestoUpdated;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try {
      const puesto = await this.findOne(id);
      if (puesto) {
        await this.puestoRepository.delete({ id: id });
        return { deleted: true, message: 'Puesto eliminado' };
      }
    } catch (error) {
      handleExeptions(error);
    }
  }
}
