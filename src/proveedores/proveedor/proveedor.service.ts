import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { Proveedor } from './entities/proveedor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProveedorParcialDto } from './dto/proveedor-parcial.dto';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import * as XLSX from "xlsx";
import { Response } from 'express';
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { Contrato } from 'src/contratos/contratos/entities/contrato.entity';
import { ESTATUS_DE_CONTRATO } from 'src/contratos/interfaces/estatus-de-contrato';
import { ContratosService } from 'src/contratos/contratos/contratos.service';
import { transformProvidersToServiceItems } from './functions/transform-providers-to-service-items';
import { PROVIDER_TYPE_REPORT_ENUM } from './enums/provider_type_report_enum';
import { transformActiveContractTracking } from './reports/active-contract-tracking/transform-active-contract-tracking';

@Injectable()
export class ProveedorService {

  constructor(

    @InjectRepository(Proveedor)
    private providerRepository: Repository<Proveedor>,

    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,

    private readonly contractService: ContratosService

  ) { }


  async create(createProviderDto: CreateProveedorDto | ProveedorParcialDto) {
    try {
      const { rfc } = createProviderDto;

      // Validación de longitud del RFC
      if (!rfc || rfc.length < 12) {
        throw new BadRequestException('¡El RFC debe contener al menos 12 caracteres!');
      }

      // Validación de longitud máxima (opcional, si aplica)
      if (rfc.length > 13) {
        throw new BadRequestException('¡El RFC no puede contener más de 13 caracteres!');
      }

      // Verificar si ya existe un proveedor con el mismo RFC
      const existingProvider = await this.findByRfc(rfc);

      if (existingProvider.length > 0) {
        throw new BadRequestException(`¡Ya existe un proveedor registrado con el RFC: ${rfc}!`);
      }

      const provider = this.providerRepository.create(createProviderDto);
      await this.providerRepository.save(provider);

      return provider;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAll(page: number) {
    try {
      const paginationSetter = new PaginationSetter();

      const proveedores = await this.providerRepository.find({
        order: {
          estatus: 'DESC',
        },
        skip: paginationSetter.getSkipElements(page),
        take: paginationSetter.castPaginationLimit(),
      });

      return proveedores;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async getProvidersWithFilters(pageParam: number, searchParams?: string) {
    try {
      const where: Record<string, any> = {};

      if (searchParams) {
        where.rfc = ILike(`%${searchParams}%`);
      }

      const paginationSetter = new PaginationSetter();

      const providers = await this.providerRepository.find({
        where,
        skip: paginationSetter.getSkipElements(pageParam),
        take: paginationSetter.castPaginationLimit(),
      });

      return providers;
    } catch (error) {
      handleExceptions(error);
    }
  }



  async findAllBusqueda() {
    try {
      const proveedores = this.providerRepository.find({
        relations: {
          estaciones: {
            municipios: true
          }
        },
      });
      return proveedores;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findByRfc(rfc: string) {
    try {
      const where: Record<string, any> = {};

      if (rfc) {
        where.rfc = ILike(`%${rfc}%`);
      }

      const providers = await this.providerRepository.find({
        where,
      });

      return providers;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const proveedor = this.providerRepository.findOne({
        where: {
          id: id,
        },
        relations: {
          contactos: true,
          contratosMaestros: true,
          estaciones: {
            municipios: true
          },
        }
      });
      if (!proveedor) throw new NotFoundException('No se encuentra el proveedor');
      return proveedor;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async getServicesByType(pageParam: number, TIPO_DE_SERVICIO: string) {
    try {
      const paginationSetter = new PaginationSetter();

      const status: boolean = true;

      const query = await this.providerRepository
        .createQueryBuilder('proveedor')
        .leftJoinAndSelect('proveedor.estaciones', 'estacion')
        .leftJoinAndSelect('estacion.servicios', 'servicio')
        .leftJoinAndSelect('servicio.renovaciones', 'renovaciones')
        .where('proveedor.estatus = :status', { status })
        .andWhere('servicio.TIPO_DE_SERVICIO = :TIPO_DE_SERVICIO', { TIPO_DE_SERVICIO })
        .andWhere('renovaciones.estatus = :status', { status })

      query
        .skip(paginationSetter.getSkipElements(pageParam))
        .take(paginationSetter.castPaginationLimit());

      const result = await query.getMany();

      if (result.length === 0) {
        return [];
      }

      const newData = transformProvidersToServiceItems(result);

      return newData;

    } catch (error) {
      handleExceptions(error);
    }
  }


  async getServicesWithFilter(pageParam: number, serviceType: TIPO_DE_SERVICIO, searchParams?: string, placeOfOperation?: string) {
    try {
      const paginationSetter = new PaginationSetter();
      const status: boolean = true;
      const query = this.providerRepository
        .createQueryBuilder('proveedor')
        .leftJoinAndSelect('proveedor.estaciones', 'estacion')
        .leftJoinAndSelect('estacion.servicios', 'servicio')
        .leftJoinAndSelect('servicio.renovaciones', 'renovacion')
        .leftJoin('estacion.municipios', 'municipio')
        .andWhere('renovacion.estatus = :status', { status })
        .andWhere('servicio.TIPO_DE_SERVICIO = :serviceType', { serviceType });

      if (searchParams) {
        query.andWhere(
          `(proveedor.rfc ILIKE :search OR estacion.nombreEstacion ILIKE :search OR servicio.nombreDeServicio ILIKE :search)`,
          { search: `%${searchParams}%` }
        );
      }

      if (placeOfOperation) {
        query.andWhere('municipio.id = :placeOfOperation', { placeOfOperation });
      }

      query
        .skip(paginationSetter.getSkipElements(pageParam))
        .take(paginationSetter.castPaginationLimit());

      const result = await query.getMany();

      if (result.length === 0) {
        return [];
      }

      const newData = transformProvidersToServiceItems(result);

      return newData;
    } catch (error) {
      handleExceptions(error);
    }
  }



  async update(id: string, updateProveedorDto: UpdateProveedorDto) {
    try {
      const proveedorDb = await this.findOne(id);
      if (proveedorDb) {
        await this.providerRepository.update(id, updateProveedorDto);
        return await this.findOne(id);
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerEstatus(id: string) {
    try {
      const proveedor = await this.providerRepository.findOne({
        where: { id: id }
      });
      if (!proveedor) throw new NotFoundException('No se encuentra el proveedor');
      return { id: proveedor.id, estatus: proveedor.estatus }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async desactivateProvider(providerId: string) {
    try {
      const activeContracts = await this.contractService.countActiveContracts(providerId);

      if (activeContracts > 0) {
        throw new NotFoundException('¡El proveedor no se puede desactivar porque hay contratos vigentes!');
      }

      await this.providerRepository.update(providerId, { estatus: false });

      return { message: '¡El proveedor ha sido desactivado con éxito!' };

    } catch (error) {
      return handleExceptions(error);
    }
  }

  async activateProvider(providerId: string) {
    try {
      const activeContracts = await this.contractService.countActiveContracts(providerId);

      if (activeContracts == 0) {
        throw new NotFoundException('¡El proveedor no se puede activar porque no hay contratos vigentes!');
      }

      await this.providerRepository.update(providerId, { estatus: true });

      return { message: '¡El proveedor ha sido activado con éxito!' };

    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerContartoDelProveedor(proveedorId: string, TIPO_DE_SERVICIO: TIPO_DE_SERVICIO) {
    try {

      const contract = await this.contratoRepository
        .createQueryBuilder('contrato')
        .leftJoinAndSelect('contrato.contratoMaestro', 'contratoMaestro')
        .where('contratoMaestro.proveedorId = :proveedorId', { proveedorId })
        .andWhere('contrato.tipo_de_servicio = :TIPO_DE_SERVICIO', { TIPO_DE_SERVICIO })
        .getMany();

      if (!contract.length) {
        throw new NotFoundException('NO SE ENCONTRARON CONTRATOS CON LOS CRITERIOS ESPECIFICADOS');
      }

      const masterContractId = contract.filter(contrato => {
        if (contrato.contratoMaestro.estatusDeContrato === ESTATUS_DE_CONTRATO.ADJUDICADO || ESTATUS_DE_CONTRATO.LIBERADO) {
          return contrato.contratoMaestro.id;
        }
      });

      if (masterContractId.length === 0) {
        throw new NotFoundException('EL PROVEEDOR NO CUENTA CON CONTRATOS ACTIVOS O ADJUDICADOS');
      }
      return masterContractId.at(0);

    } catch (error) {
      handleExceptions(error);
    }
  }

  async delete(id: string) {
    try {
      const proveedor = await this.findOne(id);
      if (proveedor) {
        await this.providerRepository.delete(id);
        return { message: 'Proveedor eliminado exitosamente' };
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async activeContractTracking() {
    try {
      const providers = await this.providerRepository
        .createQueryBuilder("proveedor")
        .leftJoinAndSelect(
          "proveedor.contratosMaestros",
          "contratoMaestro",
          "contratoMaestro.estatusDeContrato IN (:...validStatus)",
          { validStatus: [ESTATUS_DE_CONTRATO.ADJUDICADO, ESTATUS_DE_CONTRATO.LIBERADO] }
        )
        .leftJoinAndSelect("contratoMaestro.contratosModificatorios", "contratoModificatorio")
        .where("contratoMaestro.id IS NOT NULL")
        .getMany();

      if (providers.length === 0) {
        throw new BadRequestException('¡No hay información para generar este reporte!');
      }

      return providers;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async getReportInExcel(res: Response, typeProviderReport: PROVIDER_TYPE_REPORT_ENUM) {
    try {

      let dataToExport: any = [];

      let fileName: string = "";

      switch (typeProviderReport) {
        case PROVIDER_TYPE_REPORT_ENUM.ACTIVE_CONTRACTS:

          const reportOne = await this.activeContractTracking();

          dataToExport = await transformActiveContractTracking(reportOne);

          fileName = "REPORTE_CONTRATOS_ACTIVOS_POR_PROVEEDOR.xlsx";

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
