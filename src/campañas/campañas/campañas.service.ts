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
import { In, LessThan, Repository } from 'typeorm';
import { Dependencia } from '../dependencia/entities/dependencia.entity';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { ActivacionService } from '../activacion/activacion.service';
import { PartidaService } from '../partida/partida.service';
import { CAMPAIGN_STATUS } from './interfaces/estatus-campaña.enum';
import { CreateActivacionDto } from '../activacion/dto/create-activacion.dto';
import { LoggerService } from 'src/logger/logger.service';
import { FirmaService } from 'src/firma/firma/firma.service';
import { TIPO_DE_DOCUMENTO } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { Activacion } from '../activacion/entities/activacion.entity';
import { SIGNATURE_ACTION_ENUM } from 'src/firma/firma/enums/signature-action-enum';
import { getResolvedYear } from 'src/helpers/get-resolved-year';
import { AmountsTrackingByProvider } from './reports/query-response';
import * as XLSX from "xlsx";
import { transformAmountsTrackingByProvider } from './reports/amounts-tracking-by-provider/transform-amounts-tracking-by-provider';
import { Response } from "express";
import { CAMPAIGN_TYPE_REPORT } from './reports/campaign-type-report-enum';
import { transformAmountsTrackingByServiceType } from './reports/amounts-tracking-by-service-type/transform-tracking-by-service-type';
import { transformAmountsTrackingByCampaign } from './reports/amounts-tracking-by-campaign/transform-amounts-tracking-by-campaign';
import { PercentageOfServiceOrders } from './reports/percentage-of-service-orders/query-response';
import { transformPercentageOfServiceOrders } from './reports/percentage-of-service-orders/transform-percetage-of-service-orders';


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
      const currentYear = new Date().getFullYear();

      const paginationSetter = new PaginationSetter();

      const query = this.campaignRepository
        .createQueryBuilder('campaña')
        .leftJoinAndSelect('campaña.dependencias', 'dependencias')
        .leftJoinAndSelect('campaña.activaciones', 'activaciones')
        .where('EXTRACT(YEAR FROM campaña.creadoEn) = :year', { year: currentYear })
        .take(paginationSetter.castPaginationLimit())
        .skip(paginationSetter.getSkipElements(pagina));

      const campañas = await query.getMany();
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

  async getCampaignsWithFilters(pageParam: number, canAccessHistory: boolean, searchParams?: string, year?: string, status?: CAMPAIGN_STATUS) {
    try {
      const resolvedYear = getResolvedYear(year, canAccessHistory);

      const paginationSetter = new PaginationSetter();

      const query = this.campaignRepository
        .createQueryBuilder('campaña')
        .leftJoinAndSelect('campaña.dependencias', 'dependencias')
        .leftJoinAndSelect('campaña.activaciones', 'activaciones')
        .select([
          'campaña.id',
          'campaña.nombre',
          'campaña.campaignStatus',
          'campaña.creadoEn',
          'campaña.creadoEn',
          'campaña.tipoDeCampaña',
          'dependencias.id',
          'dependencias.nombre',
          'activaciones.fechaDeAprobacion',
          'activaciones.fechaDeCierre',
          'activaciones.fechaDeCreacion',
          'activaciones.fechaDeInicio',
        ]);

      if (searchParams) {
        query.andWhere(
          `(campaña.nombre ILIKE :search)`,
          { search: `%${searchParams}%` }
        );
      }

      if (status) {
        query.andWhere('campaña.campaignStatus = :status', { status });
      }

      if (resolvedYear) {
        query.andWhere("EXTRACT(YEAR FROM campaña.creadoEn) = :year", {
          year: resolvedYear,
        });
      }

      query
        .skip(paginationSetter.getSkipElements(pageParam))
        .take(paginationSetter.castPaginationLimit());

      const campañas = await query.getMany();
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

    const validStatus = [
      CAMPAIGN_STATUS.CREADA,
      CAMPAIGN_STATUS.COTIZANDO,
      CAMPAIGN_STATUS.REACTIVADA
    ];

    const { dependenciasIds } = updateCampañaDto;

    try {
      const campaign = await this.campaignRepository.findOne({
        where: { id: campañaId },
        relations: ['activaciones', "dependencias"],
      });

      if (!campaign) {
        throw new NotFoundException('¡No se ha encontrado la campaña solicitada!');
      }

      if (validStatus.includes(campaign.campaignStatus)) {

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

    const validStatus = [
      CAMPAIGN_STATUS.APROBADA,
      CAMPAIGN_STATUS.CANCELADA,
      CAMPAIGN_STATUS.REACTIVADA,
      CAMPAIGN_STATUS.CREADA,
      CAMPAIGN_STATUS.COTIZANDO
    ];

    try {
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
      });

      if (!campaign) {
        throw new NotFoundException(`¡La campaña con ID ${campaignId} no fue encontrada!`);
      }

      if (!validStatus.includes(campaign.campaignStatus)) {
        throw new Error('¡No es posible cerrar la campaña debido a un estatus no válido!');
      }

      campaign.campaignStatus = CAMPAIGN_STATUS.INACTIVA;

      await this.campaignRepository.save(campaign);

      await this.activationService.disableActivation(activationId);

      return { success: true, message: "¡Campaña cerrada exitosamente!" };

    } catch (error) {
      handleExceptions(error);
    }
  }

  async remove(campaniaId: string) {
    try {
      const campaign = await this.campaignRepository.findOne({
        where: {
          id: campaniaId,
        },
        relations: {
          activaciones: {
            partida: true,
          },
        },
      });

      if (!campaign) {
        throw new Error(`¡La campaña con ID: ${campaniaId} no fue encontrada!`);
      }

      const validStatus = [
        CAMPAIGN_STATUS.CREADA,
        CAMPAIGN_STATUS.COTIZANDO
      ];

      const isRemovable = validStatus.includes(campaign.campaignStatus)

      if (!isRemovable) {
        throw new BadRequestException(
          '¡El estatus de la campaña no permite eliminarla! Debe estar en estado "CREADA" o "COTIZANDO".'
        );
      }

      await this.campaignRepository.remove(campaign);

      return { message: '¡Campaña eliminada exitosamente!' };

    } catch (error) {
      handleExceptions(error);
    }
  }

  async createRenovation(campaignId: string, createActivationDto: CreateActivacionDto,) {
    try {

      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
        relations: {
          activaciones: true,
        },
      });

      if (!campaign) {
        throw new NotFoundException(`¡La campaña con ID ${campaignId} no fue encontrada!`);
      }

      if (!(campaign.campaignStatus === CAMPAIGN_STATUS.INACTIVA || campaign.campaignStatus === CAMPAIGN_STATUS.CANCELADA)) {
        throw new BadRequestException(`¡El estado de la campaña no es válido para reactivación. Para reactivar una campaña, su estado debe ser 'Inactiva!'`);
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

      for (const activation of campaign.activaciones) {
        activation.status = false;
      }

      await this.activationRepository.save(campaign.activaciones);

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

      await this.campaignRepository.update(campaignId, { campaignStatus: campaignStatus });

      if (campaignStatus == CAMPAIGN_STATUS.APROBADA) {
        await this.activationRepository.update(lastActivation.id, { fechaDeAprobacion: new Date() });
      }
      //  else if (campaignStatus == CAMPAIGN_STATUS.CANCELADA) {
      //   await this.closeCampaign(campaignId, lastActivation.id);
      // }

      return { message: "¡El estatus de la campaña se ha actualizado correctamente!", };

    } catch (error) {
      handleExceptions(error);
    }
  }


  async checkCampaignsExpiration() {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // Estatus válidos para desactivación
    const validStatus = [
      CAMPAIGN_STATUS.APROBADA,
      CAMPAIGN_STATUS.CANCELADA,
      CAMPAIGN_STATUS.REACTIVADA,
      CAMPAIGN_STATUS.CREADA,
      CAMPAIGN_STATUS.COTIZANDO
    ];


    // Obtener campaigns que finalizan hoy con sus relaciones
    const campaignsEndsToday = await this.campaignRepository.find({
      where: {
        activaciones: { fechaDeCierre: LessThan(today) },
        campaignStatus: In(validStatus)
      }
    });

    for (const campaign of campaignsEndsToday) {

      const lastActivation = await this.activationService.getLastActivation(campaign.id)

      await this.closeCampaign(campaign.id, lastActivation.id);
    }
  }

  async amountsTracking(): Promise<AmountsTrackingByProvider[]> {
    try {
      const data = await this.campaignRepository
        .createQueryBuilder("campaña")
        .innerJoin("campaña.ordenes", "orden")
        .leftJoin("campaña.activaciones", "activation")
        .leftJoin("orden.proveedor", "proveedor")

        .select([
          // 📁 Campaign (campaña)
          "campaña.id AS campaign_id",
          "campaña.nombre AS campaign_name",
          "campaña.campaignStatus AS campaign_status",
          "campaña.tipoDeCampaña AS campaign_type",
          "campaña.creadoEn AS campaign_created_at",
          "campaña.actualizadoEn AS campaign_updated_at",

          // 📁 Activation (activación)
          "activation.id AS activation_id",
          "activation.fechaDeInicio AS activation_start_date",
          "activation.fechaDeCierre AS activation_end_date",
          "activation.creadoEn AS activation_created_at",
          "activation.actualizadoEn AS activation_updated_at",

          // 📁 Order (orden)
          "orden.id AS order_id",
          "orden.indice AS order_index",
          "orden.estatus AS order_status",
          "orden.folio AS order_folio",
          "orden.tipoDeServicio AS order_service_type",
          "orden.fechaDeEmision AS order_emission_date",
          "orden.fechaDeAprobacion AS order_approval_date",
          "orden.subtotal AS order_subtotal",
          "orden.numberOfActivation AS order_activation_number",
          "orden.iva AS order_tax",
          "orden.total AS order_total",
          "orden.ivaIncluido AS order_tax_included",
          "orden.ordenAnteriorCancelada AS order_previous_canceled_id",
          "orden.motivoDeCancelacion AS order_cancel_reason",
          "orden.esCampania AS order_from_campaign",
          "orden.creadoEn AS order_created_at",
          "orden.actualizadoEn AS order_updated_at",
          "orden.contratoMaestroId AS order_contract_id",
          "orden.campañaId AS order_campaign_id",
          "orden.partidaId AS order_partida_id",
          "orden.proveedorId AS order_provider_id",

          // 📁 Provider (proveedor)
          "proveedor.id AS provider_id",
          "proveedor.numeroProveedor AS provider_number",
          "proveedor.representanteLegal AS provider_legal_representative",
          "proveedor.nombreComercial AS provider_commercial_name",
          "proveedor.tipoProveedor AS provider_type",
          "proveedor.rfc AS provider_rfc",
          "proveedor.razonSocial AS provider_business_name",
          "proveedor.domicilioFiscal AS provider_fiscal_address",
          "proveedor.observacionesProveedor AS provider_observations",
          "proveedor.estatus AS provider_status",
          "proveedor.creadoEn AS provider_created_at",
          "proveedor.actualizadoEn AS provider_updated_at",


        ])
        .andWhere("activation.status = :status", { status: true })
        .getRawMany();

      if (data.length === 0) {
        throw new BadRequestException('¡No hay información para generar este reporte!');
      }

      return data
    } catch (error) {
      handleExceptions(error);
    }
  }

  async percentageOfServiceOrders(): Promise<AmountsTrackingByProvider[]> {
    try {
      const data = await this.campaignRepository
        .createQueryBuilder("campaña")
        .innerJoin("campaña.ordenes", "orden")
        .leftJoin("campaña.activaciones", "activation")

        .select([
          // 📁 Campaign (campaña)
          "campaña.id AS campaign_id",
          "campaña.nombre AS campaign_name",
          "campaña.campaignStatus AS campaign_status",
          "campaña.tipoDeCampaña AS campaign_type",
          "campaña.creadoEn AS campaign_created_at",
          "campaña.actualizadoEn AS campaign_updated_at",

          // 📁 Activation (activación)
          "activation.id AS activation_id",
          "activation.fechaDeInicio AS activation_start_date",
          "activation.fechaDeCierre AS activation_end_date",
          "activation.creadoEn AS activation_created_at",
          "activation.actualizadoEn AS activation_updated_at",

          // 📁 Order (orden)
          "orden.id AS order_id",
          "orden.indice AS order_index",
          "orden.estatus AS order_status",
          "orden.folio AS order_folio",
          "orden.tipoDeServicio AS order_service_type",
          "orden.fechaDeEmision AS order_emission_date",
          "orden.fechaDeAprobacion AS order_approval_date",
          "orden.subtotal AS order_subtotal",
          "orden.numberOfActivation AS order_activation_number",
          "orden.iva AS order_tax",
          "orden.total AS order_total",
          "orden.ivaIncluido AS order_tax_included",
          "orden.ordenAnteriorCancelada AS order_previous_canceled_id",
          "orden.motivoDeCancelacion AS order_cancel_reason",
          "orden.esCampania AS order_from_campaign",
          "orden.creadoEn AS order_created_at",
          "orden.actualizadoEn AS order_updated_at",
          "orden.contratoMaestroId AS order_contract_id",
          "orden.campañaId AS order_campaign_id",
          "orden.partidaId AS order_partida_id",
          "orden.proveedorId AS order_provider_id",
        ])
        .getRawMany();

      if (data.length === 0) {
        throw new BadRequestException('¡No hay información para generar este reporte!');
      }

      return data
    } catch (error) {
      handleExceptions(error);
    }
  }

  async getReportInExcel(res: Response, typeCampaignReport: CAMPAIGN_TYPE_REPORT) {
    try {

      let dataToExport: any = [];

      let fileName: string = "";

      switch (typeCampaignReport) {
        case CAMPAIGN_TYPE_REPORT.AMOUNTS_TRACKING_BY_PROVIDER:

          const reportOne: AmountsTrackingByProvider[] = await this.amountsTracking();

          dataToExport = await transformAmountsTrackingByProvider(reportOne);

          fileName = "REPORTE_SEGUIMIENTO_DE_MONTOS_POR_PROVEDOR.xlsx";

          break;

        case CAMPAIGN_TYPE_REPORT.AMOUNTS_TRACKING_BY_SERVICE_TYPE:

          const reportTwo: AmountsTrackingByProvider[] = await this.amountsTracking();

          dataToExport = await transformAmountsTrackingByServiceType(reportTwo);

          fileName = "REPORTE_SEGUIMIENTO_DE_MONTOS_POR_TIPO_DE_SERVICIO.xlsx";

          break;

        case CAMPAIGN_TYPE_REPORT.AMOUNTS_TRACKING_BY_CAMPAIGN:

          const reportThree: AmountsTrackingByProvider[] = await this.amountsTracking();

          dataToExport = await transformAmountsTrackingByCampaign(reportThree);

          fileName = "REPORTE_SEGUIMIENTO_DE_MONTOS_POR_CAMPAÑA.xlsx";

          break;

        case CAMPAIGN_TYPE_REPORT.PERCENTAGE_OF_SERVICE_ORDERS:

          const reportFour: PercentageOfServiceOrders[] = await this.amountsTracking();

          dataToExport = await transformPercentageOfServiceOrders(reportFour);

          fileName = "REPORTE_PORCENTAJE_DE_ORDENES_DE_SERVICIO.xlsx";

          break;

        case CAMPAIGN_TYPE_REPORT.GENERAL_INVOICE:

          // const reportThree: AmountsTrackingByProvider[] = await this.amountsTracking();

          // dataToExport = await transformAmountsTrackingByCampaign(reportThree);

          throw new BadRequestException('¡No hay información para generar este reporte!');

          fileName = "REPORTE_FACTURAS_GENERAL.xlsx";

          break;

        default:
          throw new BadRequestException('¡El tipo de reporte solicitado no existe!');
      }

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

      res.send(buffer);

    } catch (error) {
      console.error("Error al generar Excel:", error);
      throw error;
    }
  }
}
