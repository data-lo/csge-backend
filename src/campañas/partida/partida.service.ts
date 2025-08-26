import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartidaDto } from './dto/create-partida.dto';
import { UpdatePartidaDto } from './dto/update-partida.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partida } from './entities/partida.entity';
import { Repository } from 'typeorm';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { Campaña } from '../campañas/entities/campaña.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { TYPE_EVENT_ORDER } from 'src/contratos/enums/type-event-order';
import { handlerAmounts } from './functions/handler-amounts';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import { TYPE_EVENT_INVOICE } from 'src/ordenes/factura/enums/type-event-invoice';


@Injectable()
export class PartidaService {
  constructor(

    @InjectRepository(Partida)
    private matchRepository: Repository<Partida>,

    @InjectRepository(Campaña)
    private campaignRepository: Repository<Campaña>,

    @InjectRepository(Orden)
    private orderRepository: Repository<Orden>,

    @InjectRepository(Factura)
    private invoiceRepository: Repository<Factura>,

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

  async updateAmounts(orderOrInvoiceId: string, eventType: TYPE_EVENT_ORDER | TYPE_EVENT_INVOICE, isInvoice: boolean) {
    try {

      let total: string;
      let campaignId: string;

      if (isInvoice) {

        const invoice = await this.invoiceRepository.findOne({
          where: { id: orderOrInvoiceId },
          relations: {
            ordenesDeServicio: { campaña: true }
          },
        });
        if (!invoice || invoice.ordenesDeServicio.length === 0) {
          throw new NotFoundException('Factura no encontrada o sin órdenes asociadas');
        }

        total = invoice.total.toString();

        campaignId = invoice.ordenesDeServicio[0].campaña.id;

      } else {

        const order = await this.orderRepository.findOne({
          where: { id: orderOrInvoiceId },
          relations: ['campaña'],
        });
        if (!order) {
          throw new NotFoundException('Orden no encontrada');
        }

        total = order.total;
        campaignId = order.campaña.id;
      }

      // Ahora puedo buscar la campaña sin errores
      const campaing = await this.campaignRepository.findOne({
        where: { id: campaignId },
        relations: {
          activaciones: { partida: true },
        },
      });
      if (!campaing) {
        throw new NotFoundException('¡Campaña no encontrada! No se pueden actualizar los montos de la partida.');
      }

      const match = campaing.activaciones.at(-1).partida;

      if (!match.estatus) {
        throw new BadRequestException('¡Partida desactivada! No es posible realizar la actualización.');
      }

      const values = {
        match: {
          paidAmount: match.montoPagado,
          executedAmount: match.montoEjercido,
          activeAmount: match.montoActivo
        },
        eventType: eventType,
        total: total
      }

      const updatedValues = await handlerAmounts(values);


      if (eventType === TYPE_EVENT_ORDER.ORDER_APPROVED || eventType === TYPE_EVENT_ORDER.ORDER_CANCELLED) {

        await this.matchRepository.update(match.id, {
          montoActivo: updatedValues.match.activeAmount,
        });
      } else if (eventType === TYPE_EVENT_INVOICE.INVOICE_REVIEWED || eventType === TYPE_EVENT_INVOICE.INVOICE_CANCELLED) {
        
        await this.matchRepository.update(match.id, {
          montoActivo: updatedValues.match.activeAmount,
          montoEjercido: updatedValues.match.executedAmount,
        });
      } else if (eventType === TYPE_EVENT_INVOICE.INVOICE_PAID) {

        await this.matchRepository.update(match.id, {
          montoEjercido: updatedValues.match.executedAmount,
          montoPagado: updatedValues.match.paidAmount,
        });
      }

      return;

    } catch (error) {
      handleExceptions(error);
    }
  }
}
