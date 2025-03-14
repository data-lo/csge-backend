import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateActivacionDto } from './dto/create-activacion.dto';
import { UpdateActivacionDto } from './dto/update-activacion.dto';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Activacion } from './entities/activacion.entity';
import { Repository } from 'typeorm';
import { Partida } from '../partida/entities/partida.entity';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { Campaña } from '../campañas/entities/campaña.entity';

@Injectable()
export class ActivacionService {

  constructor(
    @InjectRepository(Activacion)
    private activacionRepository: Repository<Activacion>,
    @InjectRepository(Partida)
    private partidaRepository: Repository<Partida>,
    @InjectRepository(Campaña)
    private campañaRepository: Repository<Campaña>

  ) { }

  async create(createActivacionDto: CreateActivacionDto) {
    try {
      const { partidaId, campaniaId, ...rest } = createActivacionDto;
      const campañaDb = await this.campañaRepository.findOneBy({ id: campaniaId });
      if (!campañaDb) throw new NotFoundException('Campaña no encontrada');
      const partidaDb = await this.partidaRepository.findOneBy({ id: partidaId })
      if (!partidaDb) throw new NotFoundException('Partida no encontrada');

      const fechaDeCreacion = new Date();

      const activacion = this.activacionRepository.create({
        partida: partidaDb,
        campaña: campañaDb,
        fechaDeCreacion: fechaDeCreacion,
        status: true,
        ...rest
      });

      await this.activacionRepository.save(activacion);
      return activacion;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter()
      const activaciones = await this.activacionRepository.find({
        take: paginationSetter.castPaginationLimit(),
        skip: paginationSetter.getSkipElements(pagina)
      });
      return activaciones;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const activacion = await this.activacionRepository.findOneBy({
        id: id
      });
      if (!activacion) throw new NotFoundException('No se encuentra la activacion');
      return activacion;
    } catch (error) {
      handleExceptions(error);
    }
  }
  async update(activationId: string, updateActivacionDto: UpdateActivacionDto) {
    try {
      const activation = await this.findOne(activationId);

      if (!activation) {
        throw new NotFoundException("¡Activación no encontrada!");
      }
      await this.activacionRepository.update(activationId, updateActivacionDto);

      return

    } catch (error) {
      console.error("Error al actualizar activación:", error);
      handleExceptions(error);
    }
  }


  async remove(id: string) {
    try {
      const activacion = await this.findOne(id);
      await this.activacionRepository.remove(activacion);
      return { message: 'Activacion eliminada correctamente' };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerEstatus(id: string) {
    try {
      const activacion = await this.findOne(id);
      return { id: activacion.id, estatus: activacion.status };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async disableActivation(activationId: string) {
    const activation = await this.activacionRepository.findOne({
      where: { id: activationId },
      relations: { partida: true }
    });

    if (!activation) {
      throw new NotFoundException('¡Activación no encontrada!');
    }

    await this.activacionRepository.update(activationId, { status: false });

    if (activation.partida) {
      await this.partidaRepository.update(activation.partida.id, { estatus: false });
    }
  }
}
