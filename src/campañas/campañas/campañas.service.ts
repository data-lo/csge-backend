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
import { In, Repository } from 'typeorm';
import { Dependencia } from '../dependencia/entities/dependencia.entity';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { ActivacionService } from '../activacion/activacion.service';
import { PartidaService } from '../partida/partida.service';
import { CAMPAIGN_STATUS } from './interfaces/estatus-campaña.enum';
import { CreateActivacionDto } from '../activacion/dto/create-activacion.dto';
import { LoggerService } from 'src/logger/logger.service';
import { FirmaService } from 'src/firma/firma/firma.service';
import { TIPO_DE_DOCUMENTO } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { Partida } from '../partida/entities/partida.entity';
import { Activacion } from '../activacion/entities/activacion.entity';
import { SIGNATURE_ACTION_ENUM } from 'src/firma/firma/enums/signature-action-enum';

@Injectable()
export class CampañasService {
  logger = new LoggerService(CampañasService.name);
  constructor(
    @InjectRepository(Campaña)
    private campaignRepository: Repository<Campaña>,

    @InjectRepository(Activacion)
    private activationRepository: Repository<Activacion>,

    @InjectRepository(Dependencia)
    private dependencyRepository: Repository<Dependencia>,

    private readonly activationService: ActivacionService,

    private readonly matchService: PartidaService,

    private readonly signatureService: FirmaService,
  ) { }

  async create(createCampañaDto: CreateCampañaDto) {
    try {
      let dependencias = [];
      const { dependenciasIds, activacion, ...rest } = createCampañaDto;

      for (const dependenciaId of dependenciasIds) {
        const dependencia = await this.dependencyRepository.findOneBy({
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

      const activacionDb = await this.activationService.create(activacion);

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

  async findOne(campaignId: string) {
    try {
      const campaign = await this.campaignRepository
        .createQueryBuilder("campaign")
        .leftJoinAndSelect("campaign.activaciones", "activacion", "activacion.status = :status", { status: true })
        .leftJoinAndSelect("activacion.partida", "partida")
        .leftJoinAndSelect("campaign.dependencias", "dependencia")
        .where("campaign.id = :campaignId", { campaignId })
        .getOne();

      if (!campaign) {
        throw new NotFoundException('¡La campaña no ha sido encontrada!');
      }

      return campaign;

    } catch (error) {
      this.logger.log('Error en encontrar una campaña');
      handleExceptions(error);
    }
  }

  async update(campañaId: string, updateCampañaDto: UpdateCampañaDto) {

    const { dependenciasIds } = updateCampañaDto;

    try {
      const campaign = await this.campaignRepository.findOne({
        where: { id: campañaId },
        relations: ['activaciones', "dependencias"],
      });

      if (!campaign) {
        throw new NotFoundException('¡No se ha encontrado la campaña solicitada!');
      }

      if (campaign.campaignStatus === CAMPAIGN_STATUS.CREADA || campaign.campaignStatus === CAMPAIGN_STATUS.COTIZANDO) {

        const campaignUpdateData = await this.campaignRepository.merge(campaign, updateCampañaDto);

        await this.campaignRepository.save(campaignUpdateData);

        const newDependencies = await this.dependencyRepository.findBy({
          id: In(dependenciasIds),
        });

        campaign.dependencias = newDependencies;

        await this.campaignRepository.save(campaign);

        return { message: '¡Campaña actualizada exitosamente!' };
      }

      throw new BadRequestException('¡El estatus de la campaña no permite actualizaciones!');

    } catch (error) {
      handleExceptions(error);
    }
  }

  async closeCampaign(campaignId: string, activationId: string) {
    try {

      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
      });

      if (!campaign) {
        throw new NotFoundException(`¡La campaña con ID ${campaignId} no fue encontrada!`);
      }

      if (campaign.campaignStatus === CAMPAIGN_STATUS.PENDIENTE) {
        await this.signatureService.updateDocumentByDocumentIdAndActivation(campaignId, activationId)
      }

      campaign.campaignStatus = CAMPAIGN_STATUS.INACTIVA;

      await this.campaignRepository.save(campaign);

      await this.activationService.disableActivation(activationId);

      return { success: true, message: "¡Campaña cerrada exitosamente!" };

    } catch (error) {
      console.error(`Error al cerrar la campaña (ID: ${campaignId}):`, error);
      throw new InternalServerErrorException("Hubo un problema al cerrar la campaña. Inténtalo de nuevo.");
    }
  }

  async remove(campaniaId: string) {
    try {
      const campaignId = await this.campaignRepository.findOne({
        where: {
          id: campaniaId,
        },
        relations: {
          activaciones: {
            partida: true,
          },
        },
      });
      if (!campaignId)
        throw new Error(`La Campaña con ID: ${campaignId} no se encontró.`);
      if (
        campaignId.campaignStatus === CAMPAIGN_STATUS.CREADA ||
        campaignId.campaignStatus === CAMPAIGN_STATUS.COTIZANDO
      ) {
        await this.campaignRepository.remove(campaignId);
        return { message: 'Campaña eliminada existosamente' };
      }
      throw new BadRequestException(
        'Estatus de campaña no valido para eliminar, cancelar campaña',
      );
    } catch (error) {
      handleExceptions(error);
    }
  }

  async createRenovation(campaignId: string, createActivationDto: CreateActivacionDto,) {
    try {
      const campaign = await this.campaignRepository.findOne({ where: { id: campaignId }, });

      if (!campaign) {
        throw new NotFoundException(`¡La campaña con ID ${campaignId} no fue encontrada!`);
      }

      if (!(campaign.campaignStatus === CAMPAIGN_STATUS.INACTIVA || campaign.campaignStatus === CAMPAIGN_STATUS.CANCELADA)) {
        throw new BadRequestException('El estado de la campaña no es válido para reactivación. Para reactivar una campaña, su estado debe ser INACTIVA.');
      }

      const newMatchObject = { montoActivo: 0, montoEjercido: 0, montoPagado: 0, };

      const newMatch = await this.matchService.create(newMatchObject);

      const newActivationObject = {
        campaniaId: campaignId,
        partidaId: newMatch.id,
        fechaDeCierre: createActivationDto.fechaDeCierre,
        fechaDeInicio: createActivationDto.fechaDeInicio,
        status: true,
        fechaDeAprobacion: null
      }
      campaign.campaignStatus = CAMPAIGN_STATUS.REACTIVADA

      await this.campaignRepository.save(campaign);

      await this.activationService.create(newActivationObject)

      return { message: '¡La campaña ha sido reactivada con éxito!' };

    } catch (error) {

      if (!error.partidaId) {
        handleExceptions(error);
      }
      await this.matchService.remove(error.partidaId);
      handleExceptions(error.message);
    }
  }

  async sendToSigningCampaign(campaignId: string, signatureAction: SIGNATURE_ACTION_ENUM) {
    try {
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId }
      });

      if (!campaign) {
        throw new NotFoundException(`¡La campaña con ID ${campaignId} no fue encontrada!`);
      }

      const activation = await this.activationService.getLastActivation(campaignId);

      await this.validateCampaignStatusForSignatureAction(campaign.campaignStatus, signatureAction);

      const signatureObject = {
        isSigned: false,
        documentId: campaignId,
        documentType: TIPO_DE_DOCUMENTO.CAMPAÑA,
        activationId: activation.id,
        signatureAction: signatureAction
      };

      await this.signatureService.create(signatureObject);

      campaign.campaignStatus = CAMPAIGN_STATUS.PENDIENTE;

      await this.campaignRepository.save(campaign);

      return { message: '¡La campaña ha sido enviada al módulo de firma!' };

    } catch (error) {
      handleExceptions(error);
    }
  }

  async getCampaignDocument(id: string) {
    const document = await this.signatureService.downloadFile(id, TIPO_DE_DOCUMENTO.CAMPAÑA);

    return document;
  }


  private async validateCampaignStatusForSignatureAction(campaignStatus: CAMPAIGN_STATUS, signatureAction: SIGNATURE_ACTION_ENUM) {
    console.log(campaignStatus)
    console.log(signatureAction)
    // Estatus válidos para aprobación
    const VALID_APPROVAL_STATES = [
      CAMPAIGN_STATUS.CREADA,
      CAMPAIGN_STATUS.COTIZANDO,
      CAMPAIGN_STATUS.REACTIVADA,
    ];

    // Estatus válidos para cancelación
    const VALID_CANCELLATION_STATES = [
      CAMPAIGN_STATUS.APROBADA,
    ];

    // Validación cuando se quiere cancelar
    if (signatureAction === SIGNATURE_ACTION_ENUM.CANCEL) {
      if (!VALID_CANCELLATION_STATES.includes(campaignStatus)) {
        throw new BadRequestException('¡La campaña debe estar aprobada antes de solicitar la firma de cancelación!');
      }
    }
    // Validación cuando se quiere aprobar
    else if (signatureAction === SIGNATURE_ACTION_ENUM.APPROVE) {
      if (!VALID_APPROVAL_STATES.includes(campaignStatus)) {
        throw new BadRequestException('¡La campaña no tiene un estatus válido para solicitar la firma de aprobación!');
      }
    }
    // Si `signatureAction` no es válido, lanzar error
    else {
      throw new BadRequestException('¡Acción de firma no válida!');
    }
  }

  async updateCampaignStatus(campaignId: string, campaignStatus: CAMPAIGN_STATUS) {
    try {

      const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });

      if (!campaign) {
        throw new Error(`La Campaña con ID: ${campaignId} no se encontró.`);
      }

      const lastActivation = await this.activationService.getLastActivation(campaignId);

      if (campaignStatus == CAMPAIGN_STATUS.APROBADA) {
        await this.activationRepository.update(lastActivation.id, { fechaDeAprobacion: new Date() });

      } else if (campaignStatus == CAMPAIGN_STATUS.CANCELADA) {
        await this.closeCampaign(campaignId, lastActivation.id);
      }

      await this.campaignRepository.update(campaignId, { campaignStatus: campaignStatus });

      return { message: "¡El estatus de la campaña se ha actualizado correctamente!", };

    } catch (error) {
      handleExceptions(error);
    }
  }
}
