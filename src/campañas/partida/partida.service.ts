import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartidaDto } from './dto/create-partida.dto';
import { UpdatePartidaDto } from './dto/update-partida.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partida } from './entities/partida.entity';
import { Repository, ReturnDocument } from 'typeorm';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { Campaña } from '../campañas/entities/campaña.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { timeStamp } from 'console';

@Injectable()
export class PartidaService {
  constructor(

    @InjectRepository(Partida)
    private matchRepository: Repository<Partida>,

    @InjectRepository(Campaña)
    private campañaRepository: Repository<Campaña>,

    @InjectRepository(Orden)
    private ordenRepository: Repository<Orden>

  ) { }


  async create(createPartidaDto: CreatePartidaDto) {
    try {
      const match = this.matchRepository.create(createPartidaDto);

      await this.matchRepository.save(match);

      return match;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter()
      const partidas = await this.matchRepository.find({
        take: paginationSetter.castPaginationLimit(),
        skip: paginationSetter.getSkipElements(pagina)
      });
      return partidas;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findOne(partidaId: string) {
    try {
      const partida = await this.matchRepository.findOne({
        where: { id: partidaId },
      });
      if (!partida) throw new NotFoundException('La partida no exisite');
      return partida;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async update(matchId: string, updatePartidaDto: UpdatePartidaDto) {
    try {
      const partidaDb = await this.matchRepository.findOne({
        where: { id: matchId }
      });

      if (!partidaDb) {
        throw new NotFoundException('¡La partida especificada no fue encontrada!');
      }

      Object.assign(partidaDb, updatePartidaDto);

      await this.matchRepository.save(partidaDb);

      return { message: '¡Partida actualizada exitosamente!' };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async disableMatch(matchId: string) {

      const match = await this.matchRepository.findOneBy({ id: matchId });

      if (!match) {
        throw new NotFoundException('¡Partida no encontrada!');
      }

  }


  async obtenerEstatus(id: string) {
    try {
      const partida = await this.findOne(id);
      return { id: partida.id, estatus: partida.estatus };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerMontos(id: string) {
    try {
      const partida = await this.findOne(id);
      return {
        montoActivo: partida.montoActivo,
        montoEjercido: partida.montoEjercido,
        montoPagado: partida.montoPagado
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const partidaDb = await this.matchRepository.findOneBy({ id: id });
      if (!partidaDb) throw new NotFoundException('No se encuentra la partida');
      await this.matchRepository.remove(partidaDb);
      return { message: 'Partida eliminada exitosamente' };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async updateAmounts(ordenId: string, ) {
    try {
      const order = await this.ordenRepository.findOne({
        where: { id: ordenId },
        relations: { campaña: true }
      }
      );

      const campaing = await this.campañaRepository.findOne({
        where: { id: order.campaña.id },
        relations: {
          activaciones: {
            partida: true
          }
        }
      });

      if (!campaing) {
        throw new NotFoundException('¡Campaña no encontrada! No se pueden actualizar los montos de la partida.');
      }

      const match = campaing.activaciones.at(-1).partida;

      if (!match.estatus){
        throw new BadRequestException('¡Partida desactivada! No es posible realizar la actualización.');
      }

      await this.matchRepository.save(match);

      return;

    } catch (error) {
      handleExceptions(error);
    }
  }
}
