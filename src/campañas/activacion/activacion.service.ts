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
import { Orden } from 'src/ordenes/orden/entities/orden.entity';

@Injectable()
export class ActivacionService {

  constructor(
    @InjectRepository(Activacion)
    private activationRepository: Repository<Activacion>,
    @InjectRepository(Partida)
    private partidaRepository: Repository<Partida>,
    @InjectRepository(Campaña)
    private campañaRepository: Repository<Campaña>,

    @InjectRepository(Orden)
    private orderRepository: Repository<Orden>

  ) { }

  async create(createActivacionDto: CreateActivacionDto) {
    try {
      const { partidaId, campaniaId, ...rest } = createActivacionDto;
      const campañaDb = await this.campañaRepository.findOneBy({ id: campaniaId });
      if (!campañaDb) throw new NotFoundException('Campaña no encontrada');
      const partidaDb = await this.partidaRepository.findOneBy({ id: partidaId })
      if (!partidaDb) throw new NotFoundException('Partida no encontrada');

      const fechaDeCreacion = new Date();

      const activacion = this.activationRepository.create({
        partida: partidaDb,
        campaña: campañaDb,
        fechaDeCreacion: fechaDeCreacion,
        status: true,
        ...rest
      });

      await this.activationRepository.save(activacion);
      return activacion;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async getLastActivation(campaignId: string, orderId?: string) {

    let whereCondition: any = { campaña: { id: campaignId } };
  
    if (orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['partida'],
      });
  
      if (!order || !order.partida) {
        throw new NotFoundException(`No se encontró una orden con ID ${orderId} o no tiene partida asociada.`);
      }
  
      whereCondition = { partida: { id: order.partida.id } };
    }
  
    const lastActivation = await this.activationRepository.findOne({
      where: whereCondition,
      order: { creadoEn: 'DESC' },
      relations: ['partida'],
    });
  
    return lastActivation;
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter()
      const activaciones = await this.activationRepository.find({
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
      const activacion = await this.activationRepository.findOneBy({
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
      await this.activationRepository.update(activationId, updateActivacionDto);

      return

    } catch (error) {
      console.error("Error al actualizar activación:", error);
      handleExceptions(error);
    }
  }


  async remove(id: string) {
    try {
      const activacion = await this.findOne(id);
      await this.activationRepository.remove(activacion);
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
    const activation = await this.activationRepository.findOne({
      where: { id: activationId },
      relations: { partida: true }
    });

    if (!activation) {
      throw new NotFoundException('¡Activación no encontrada!');
    }

    await this.activationRepository.update(activationId, { status: false });

    if (activation.partida) {
      await this.partidaRepository.update(activation.partida.id, { estatus: false });
    }
  }
}
