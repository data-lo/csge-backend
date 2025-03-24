import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { Proveedor } from './entities/proveedor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProveedorParcialDto } from './dto/proveedor-parcial.dto';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { Contrato } from 'src/contratos/contratos/entities/contrato.entity';
import { ESTATUS_DE_CONTRATO } from 'src/contratos/interfaces/estatus-de-contrato';
import { ContratosService } from 'src/contratos/contratos/contratos.service';

@Injectable()
export class ProveedorService {

  constructor(
    private eventEmitter: EventEmitter2,

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
      if (existingProvider) {
        throw new BadRequestException(`¡Ya existe un proveedor registrado con el RFC: ${rfc}!`);
      }
  
      const provider = this.providerRepository.create(createProviderDto);
      await this.providerRepository.save(provider);
  
      return provider;
    } catch (error) {
      handleExceptions(error);
    }
  }
  


  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter()
      const proveedores = await this.providerRepository.find({
        order: {
          estatus: 'DESC',
        },
        skip: paginationSetter.getSkipElements(pagina),
        take: paginationSetter.castPaginationLimit(),
      });
      return proveedores;
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
      const provider = await this.providerRepository.createQueryBuilder('proveedor')
        .where('proveedor.rfc LIKE :rfc', { rfc: `${rfc.toUpperCase()}%` })
        .getMany();

      if (provider.length === 0) {
        return undefined;
      };
      return provider;
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

  async findByService(TIPO_DE_SERVICIO: string) {
    try {
      const estatus: boolean = true;
      const proveedores = await this.providerRepository
        .createQueryBuilder('proveedor')
        .leftJoinAndSelect('proveedor.estaciones', 'estacion')
        .leftJoinAndSelect('estacion.servicios', 'servicio')
        .leftJoinAndSelect('servicio.renovaciones', 'renovaciones')
        .where('proveedor.estatus = :estatus', { estatus })
        .andWhere('servicio.TIPO_DE_SERVICIO = :TIPO_DE_SERVICIO', { TIPO_DE_SERVICIO })
        .andWhere('renovaciones.estatus = :estatus', { estatus })
        .getMany();
      // console.log(proveedores[0].estaciones)
      return proveedores;



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



  // async emitter(proveedor: Proveedor, evento: string) {
  //   this.eventEmitter.emit(
  //     `proveedor.${evento}`,
  //     new ProveedorEvent({ proveedor }),
  //   )
  // }

}
