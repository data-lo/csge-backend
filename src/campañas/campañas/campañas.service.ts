import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCampañaDto } from './dto/create-campaña.dto';
import { UpdateCampañaDto } from './dto/update-campaña.dto';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Campaña } from './entities/campaña.entity';
import { Repository } from 'typeorm';
import { Dependencia } from '../dependencia/entities/dependencia.entity';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { ActivacionService } from '../activacion/activacion.service';
import { PartidaService } from '../partida/partida.service';
import { CAMPAIGN_STATUS } from './interfaces/estatus-campaña.enum';
import { CreateActivacionDto } from '../activacion/dto/create-activacion.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CampaniaEvent } from './interfaces/campaña-evento';
import { LoggerService } from 'src/logger/logger.service';
import { FirmaService } from 'src/firma/firma/firma.service';
import { TIPO_DE_DOCUMENTO } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { Partida } from '../partida/entities/partida.entity';
import { Activacion } from '../activacion/entities/activacion.entity';

@Injectable()
export class CampañasService {
  logger = new LoggerService(CampañasService.name);
  constructor(
    private eventEmitter: EventEmitter2,

    @InjectRepository(Campaña)
    private campaignRepository: Repository<Campaña>,

    @InjectRepository(Campaña)
    private matchRepository: Repository<Partida>,

    @InjectRepository(Activacion)
    private activationRepository: Repository<Activacion>,

    @InjectRepository(Dependencia)
    private dependeciaRepository: Repository<Dependencia>,
    private readonly activacionService: ActivacionService,
    private readonly matchService: PartidaService,
    private readonly firmaService: FirmaService,
  ) { }

  async create(createCampañaDto: CreateCampañaDto) {
    try {
      let dependencias = [];
      const { dependenciasIds, activacion, ...rest } = createCampañaDto;

      for (const dependenciaId of dependenciasIds) {
        const dependencia = await this.dependeciaRepository.findOneBy({
          id: dependenciaId,
        });
        if (!dependencia)
          throw new NotFoundException('No se encuentra la dependencia');
        dependencias.push(dependencia);
      }

      const campaña = this.campaignRepository.create({
        dependencias: dependencias,
        ...rest,
      });

      const campañaDb = await this.campaignRepository.save(campaña);

      const partidaDto = {
        montoActivo: 0,
        montoEjercido: 0,
        montoPagado: 0,
      };
      const partidaDb = await this.matchService.create(partidaDto);
      if (!partidaDb)
        throw new InternalServerErrorException({
          message: 'No se logro crear la partida',
          campaniaId: campañaDb.id,
        });

      activacion.campaniaId = campaña.id;
      activacion.partidaId = partidaDb.id;

      const activacionDb = await this.activacionService.create(activacion);

      if (!activacionDb)
        throw new InternalServerErrorException({
          message: 'No se logro crear la activacion',
          campaniaId: campañaDb.id,
        });
      return campaña;
    } catch (error) {
      await this.remove(error.campaniaId);
      handleExceptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter();
      const campañas = await this.campaignRepository.find({
        take: paginationSetter.castPaginationLimit(),
        skip: paginationSetter.getSkipElements(pagina),
        relations: {
          dependencias: true,
          activaciones: true,
        },
        select: {
          activaciones: {
            fechaDeAprobacion: true,
            fechaDeCierre: true,
            fechaDeCreacion: true,
            fechaDeInicio: true,
          },
        },
      });
      return campañas;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAllBusuqueda() {
    try {
      const campañas = await this.campaignRepository.find({
        relations: {
          dependencias: true,
          activaciones: true,
        },
        select: {
          activaciones: {
            fechaDeAprobacion: true,
            fechaDeCierre: true,
            fechaDeCreacion: true,
            fechaDeInicio: true,
          },
        },
      });
      return campañas;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {

      let montoEjercido = 0;
      let montoActivo = 0;
      let montoPagado = 0;

      const campaña = await this.campaignRepository.findOne({
        where: { id: id },
        relations: {
          activaciones: {
            partida: true,
          },
          dependencias: true,
        },
      });

      if (!campaña) throw new NotFoundException('Campaña no encontrada');

      const partidas = campaña.activaciones.map((activacion) => {
        return activacion.partida;
      });

      partidas.forEach((partida) => {
        montoActivo += Number(partida.montoActivo);
        montoEjercido += Number(partida.montoEjercido);
        montoPagado += Number(partida.montoPagado);
      });
      return {
        ...campaña,
        montos: {
          montoActivo: montoActivo,
          montoEjercido: montoEjercido,
          montoPagado: montoPagado,
        },
      };
    } catch (error) {
      this.logger.log('Error en encontrar una campaña');
      handleExceptions(error);
    }
  }

  async cancelarCampaña(campañaId: string) {
    try {
      const campañaDb = await this.campaignRepository.findOneBy({
        id: campañaId,
      });
      if (!campañaDb) throw new NotFoundException('No se encuentra la campaña');
      if (
        campañaDb.estatus ===
        (CAMPAIGN_STATUS.CREADA || CAMPAIGN_STATUS.COTIZANDO)
      ) {
        throw new BadRequestException(
          'La campaña no puede ser cancelada bajo este estatus, eliminar o modificar campaña',
        );
      }
      campañaDb.estatus = CAMPAIGN_STATUS.CANCELADA;
      await this.campaignRepository.save(campañaDb);
      return { message: 'Campaña cancelada exitosamente' };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async update(campañaId: string, updateCampañaDto: UpdateCampañaDto) {
    try {

      const campaign = await this.campaignRepository.findOne({
        where: { id: campañaId },
        relations: ['activaciones'],
      });

      if (!campaign) throw new NotFoundException('No se ha encontrado la campaña solicitada.');

      if (campaign.estatus === CAMPAIGN_STATUS.CREADA || campaign.estatus === CAMPAIGN_STATUS.COTIZANDO) {

        const campaignUpdateData = this.campaignRepository.merge(campaign, updateCampañaDto);

        await this.campaignRepository.save(campaignUpdateData);

        return { message: 'Campaña actualizada exitosamente' };
      }

      throw new BadRequestException('Estatus de campaña no válido para actualizar o cancelar.');
    } catch (error) {
      handleExceptions(error);
    }
  }


  async remove(campaniaId: string) {
    try {
      const campaniaDb = await this.campaignRepository.findOne({
        where: {
          id: campaniaId,
        },
        relations: {
          activaciones: {
            partida: true,
          },
        },
      });
      if (!campaniaDb)
        throw new NotFoundException('No se encuentra la campaña');
      if (
        campaniaDb.estatus === CAMPAIGN_STATUS.CREADA ||
        campaniaDb.estatus === CAMPAIGN_STATUS.COTIZANDO
      ) {
        await this.campaignRepository.remove(campaniaDb);
        return { message: 'Campaña eliminada existosamente' };
      }
      throw new BadRequestException(
        'Estatus de campaña no valido para eliminar, cancelar campaña',
      );
    } catch (error) {
      handleExceptions(error);
    }
  }

  async agregarActivacion(
    campañaId: string,
    createActivacionDto: CreateActivacionDto,
  ) {
    try {
      const campañaDb = await this.campaignRepository.findOne({
        where: { id: campañaId },
        relations: {
          activaciones: true,
        },
      });

      if (!campañaDb) throw new NotFoundException('¡La campaña no fue encontrada!');

      if (campañaDb.estatus !== CAMPAIGN_STATUS.INACTIVA) throw new BadRequestException('El estado de la campaña no es válido para reactivación. Para reactivar una campaña, su estado debe ser INACTIVA.');

      const activaciones = campañaDb.activaciones;
      const index = activaciones.length;
      const ultimaActivacion = activaciones[index - 1];
      const activacionResponse = await this.activacionService.desactivar(
        ultimaActivacion.id,
      );
      if (!activacionResponse.estatus)
        throw new InternalServerErrorException(
          'Desactivacion de activacion fallido',
        );

      const partida = {
        montoActivo: 0,
        montoEjercido: 0,
        montoPagado: 0,
      };
      const partidaDb = await this.matchService.create(partida);
      if (!partidaDb)
        throw new InternalServerErrorException(
          'Creacion de nueva partida fallida',
        );

      const activacionDb = await this.activacionService.create({
        partidaId: partidaDb.id,
        campaniaId: campañaDb.id,
        ...createActivacionDto,
      });

      if (!activacionDb)
        throw new InternalServerErrorException({
          message: 'No se creo la activacion correctamente',
          partidaId: partidaDb.id,
        });

      campañaDb.estatus = CAMPAIGN_STATUS.REACTIVADA;
      await this.campaignRepository.save(campañaDb);
      return {
        message: 'campaña reactivada exitosamente',
        activacion: activacionDb,
      };
    } catch (error) {
      //Si no se reactiva bien la campaña, eliminar las entidades creadas
      if (!error.partidaId) {
        handleExceptions(error);
      }
      await this.matchService.remove(error.partidaId);
      handleExceptions(error.message);
    }
  }

  async mandarCampañaAAprobar(campaignId: string) {
    try {
      const campaniaDb = await this.campaignRepository.findOneBy({ id: campaignId });

      if (!campaniaDb)
        throw new NotFoundException('NO SE ENCUENTRA LA CAMPAÑA');

      const estatusValidos = [
        CAMPAIGN_STATUS.CREADA,
        CAMPAIGN_STATUS.COTIZANDO,
        CAMPAIGN_STATUS.REACTIVADA,
      ];

      if (!estatusValidos.includes(campaniaDb.estatus)) {
        throw new BadRequestException('LA CAMPAÑA NO CUENTA CON ESTATUS PARA SER APROBADA',);
      }


      const signatureObject = {
        estaFirmado: false,
        ordenOFacturaId: campaignId,
        tipoDeDocumento: TIPO_DE_DOCUMENTO.CAMPAÑA,
      };

      await this.firmaService.create(signatureObject);

      campaniaDb.estatus = CAMPAIGN_STATUS.PENDIENTE;

      await this.campaignRepository.save(campaniaDb);

      return { message: 'CAMPAÑA ESPERANDO APROBACIÓN' };

    } catch (error) {
      handleExceptions(error);
    }
  }

  async getApprovalCampaignDocument(id: string) {
    const document = await this.firmaService.descargarDocumento(id, TIPO_DE_DOCUMENTO.CAMPAÑA);

    return document;
  }

  async getActiveMatch(campaignId: string) {

    try {
      const lastMatch = await this.matchRepository.findOne({
        where: {

          estatus: true
        }
      })

      return lastMatch
    } catch (error) {
      handleExceptions(error);
    }
  }

  async updateCampaignStatus(campaignId: string, status: CAMPAIGN_STATUS) {
    try {

      const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });

      if (!campaign) {
        throw new Error(`La Campaña con ID: ${campaignId} no se encontró.`);
      }

      const campaignWithActiveActivation = await this.campaignRepository
        .createQueryBuilder('campaña')
        .innerJoinAndSelect('campaña.activaciones', 'activacion')
        .where('campaña.id = :campaignId', { campaignId })
        .andWhere('activacion.estatus = :status', { status: true })
        .getOne();

      const currentlyActivation = campaignWithActiveActivation.activaciones[0];

      if (status == CAMPAIGN_STATUS.APROBADA) {
        await this.activationRepository.update(currentlyActivation.id, { fechaDeAprobacion: new Date() });
      }
      
      await this.campaignRepository.update(campaignId, { estatus: status });

      return { message: "¡El estatus de la campaña se ha actualizado correctamente!", };

    } catch (error) {
      handleExceptions(error);
    }
  }



  async emitter(campaniaId: string, evento: string) {
    this.eventEmitter.emit(`campania.${evento}`, new CampaniaEvent(campaniaId));
  }
}
