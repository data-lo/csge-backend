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
import { ESTATUS_ORDEN_DE_SERVICIO } from 'src/ordenes/orden/interfaces/estatus-orden-de-servicio';
import { ServicioContratado } from 'src/ordenes/servicio_contratado/entities/servicio_contratado.entity';
import { ContratoMaestro } from 'src/contratos/contratos/entities/contrato.maestro.entity';
import Decimal from 'decimal.js';

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
    private orderRepository: Repository<Orden>,

    @InjectRepository(ContratoMaestro)
    private masterContractRepository: Repository<ContratoMaestro>,


    @InjectRepository(ServicioContratado)
    private contractedServiceRepository: Repository<ServicioContratado>,

  ) { }

  async create(createActivacionDto: CreateActivacionDto) {
    try {
      const { partidaId, campaniaId, ...rest } = createActivacionDto;

      const campaign = await this.campañaRepository.findOneBy({
        id: campaniaId
      });

      if (!campaign) {
        throw new NotFoundException(`¡No se encontró la campaña con ID: ${campaign.id}!`);
      }

      const match = await this.partidaRepository.findOneBy({
        id: partidaId
      });

      if (!match) {
        throw new NotFoundException(`¡No se encontró la partida con ID: ${partidaId}!`);
      }

      const lastActivation = await this.getLastActivation(campaign.id);

      const numberOfActivation = lastActivation.numberOfActivation += 1

      const currentlyDate = new Date();

      const activation = this.activationRepository.create({
        partida: match,
        campaña: campaign,
        numberOfActivation,
        fechaDeCreacion: currentlyDate,
        status: true,
        ...rest
      });

      await this.activationRepository.save(activation);

      return activation;

    } catch (error) {
      handleExceptions(error);
    }
  }

  /**
  * Obtiene la última activación asociada a una campaña.
  * 
  * Si se proporciona un `orderId`, en lugar de buscar por campaña,
  * se buscará la última activación relacionada con la partida de esa orden.
  * 
  * @param {string} campaignId - ID de la campaña para la que se desea obtener la última activación.
  * @param {string} [orderId] - (Opcional) ID de la orden a partir de la cual se determina la activación relacionada.
  * 
  * @returns {Promise<ActivacionEntity | null>} - Retorna la última activación encontrada, o `null` si no existe.
  * 
  * @throws {NotFoundException} - Lanza una excepción si el `orderId` es proporcionado pero no se encuentra la orden o no tiene partida.
  */
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
      relations: { partida: true, campaña: true }
    });

    if (!activation) {
      throw new NotFoundException('¡Activación no encontrada!');
    }

    await this.activationRepository.update(activationId, { status: false });

    if (activation.partida) {
      await this.partidaRepository.update(activation.partida.id, { estatus: false });
    }

    const orders = await this.orderRepository.find({
      where: {
        campaña: { id: activation.campaña.id },
        partida: { id: activation.partida.id },
        estatus: ESTATUS_ORDEN_DE_SERVICIO.PENDIENTE
      },
      relations: ['contratoMaestro', 'serviciosContratados']
    });

    for (const order of orders) {

      for (const contractedService of order.serviciosContratados) {
        await this.contractedServiceRepository.delete(contractedService.id);
      }

      const masterContractRepository = await this.masterContractRepository.findOne({
        where: {
          id: order.contratoMaestro.id
        }
      });

      const newCommittedAmount = new Decimal(masterContractRepository.committedAmount).minus(new Decimal(order.total)).toDecimalPlaces(4);

      await this.masterContractRepository.update(masterContractRepository.id, {
        committedAmount: newCommittedAmount.toString()
      })

      await this.orderRepository.remove(order);
    }
  }
}
