import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { Proveedor } from './entities/proveedor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProveedorParcialDto } from './dto/proveedor-parcial.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProveedorEvent } from './interfaces/proveedor-evento';
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { Contrato } from 'src/contratos/contratos/entities/contrato.entity';
import { ESTATUS_DE_CONTRATO } from 'src/contratos/interfaces/estatus-de-contrato';

@Injectable()
export class ProveedorService {

  constructor(
    private eventEmitter: EventEmitter2,

    @InjectRepository(Proveedor)
    private proveedorRepository: Repository<Proveedor>,
    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>
  ) { }


  async create(createProveedorDto: CreateProveedorDto | ProveedorParcialDto) {
    try {

      if (createProveedorDto.rfc.length < 12) throw new BadRequestException('El RFC debe de contener minimo 12 caracteres');

      if (createProveedorDto.rfc.length === 12 || createProveedorDto.rfc.length === 13) {
        const proveedorExistente = await this.findByRfc(createProveedorDto.rfc);

        if (proveedorExistente) {
          return proveedorExistente[0];
        }
      }

      const proveedor = this.proveedorRepository.create(createProveedorDto);
      await this.proveedorRepository.save(proveedor);
      return proveedor;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter()
      const proveedores = this.proveedorRepository.find({
        skip: paginationSetter.getSkipElements(pagina),
        take: paginationSetter.castPaginationLimit(),
      });
      return proveedores;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAllBusqueda() {
    try {
      const proveedores = this.proveedorRepository.find({
        relations: {
          estaciones: {
            municipios: true
          }
        },
      });
      return proveedores;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findByRfc(rfc: string) {
    try {
      const proveedor = await this.proveedorRepository.createQueryBuilder('proveedor')
        .where('proveedor.rfc LIKE :rfc', { rfc: `${rfc.toUpperCase()}%` })
        .getMany();
      if (proveedor.length === 0) return undefined;
      return proveedor;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const proveedor = this.proveedorRepository.findOne({
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
      handleExeptions(error);
    }
  }

  async findByService(TIPO_DE_SERVICIO: string) {
    try {
      const estatus: boolean = true;
      const proveedores = await this.proveedorRepository
        .createQueryBuilder('proveedor')
        .leftJoinAndSelect('proveedor.estaciones', 'estacion')
        .leftJoinAndSelect('estacion.servicios', 'servicio')
        .leftJoinAndSelect('servicio.renovaciones', 'renovaciones')
        .where('proveedor.estatus = :estatus', { estatus })
        .andWhere('servicio.TIPO_DE_SERVICIO = :TIPO_DE_SERVICIO', { TIPO_DE_SERVICIO })
        .andWhere('renovaciones.estatus = :estatus', { estatus })
        .getMany();

      return proveedores;

    } catch (error) {
      handleExeptions(error);
    }
  }

  async update(id: string, updateProveedorDto: UpdateProveedorDto) {
    try {
      const proveedorDb = await this.findOne(id);
      if (proveedorDb) {
        await this.proveedorRepository.update(id, updateProveedorDto);
        return await this.findOne(id);
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerEstatus(id: string) {
    try {
      const proveedor = await this.proveedorRepository.findOne({
        where: { id: id }
      });
      if (!proveedor) throw new NotFoundException('No se encuentra el proveedor');
      return { id: proveedor.id, estatus: proveedor.estatus }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async desactivateProvider(providerId: string) {
    try {
      await this.proveedorRepository.update(providerId, { estatus: false });

      return { message: '¡El proveedor ha sido desactivado con éxito!' };

    } catch (error) {
      return handleExeptions(error);
    }
  }


  async activateProvider(providerId: string) {
    try {
      await this.proveedorRepository.update(providerId, { estatus: true });

      return { message: '¡El proveedor ha sido activado con éxito!' };

    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerContartoDelProveedor(proveedorId: string, TIPO_DE_SERVICIO: TIPO_DE_SERVICIO) {
    try {

      const contrato = await this.contratoRepository
        .createQueryBuilder('contrato')
        .leftJoinAndSelect('contrato.contratoMaestro', 'contratoMaestro')
        .where('contratoMaestro.proveedorId = :proveedorId', { proveedorId })
        .andWhere('contrato.tipo_de_servicio = :TIPO_DE_SERVICIO', { TIPO_DE_SERVICIO })
        .getMany();

      if (!contrato.length) {
        throw new NotFoundException('NO SE ENCONTRARON CONTRATOS CON LOS CRITERIOS ESPECIFICADOS');
      }

      const contratoMaestroId = contrato.filter(contrato => {
        if (contrato.contratoMaestro.estatusDeContrato === ESTATUS_DE_CONTRATO.ADJUDICADO || ESTATUS_DE_CONTRATO.LIBERADO) {
          return contrato.contratoMaestro.id;
        }
      });

      if (contratoMaestroId.length === 0) {
        throw new NotFoundException('EL PROVEEDOR NO CUENTA CON CONTRATOS ACTIVOS O ADJUDICADOS');
      }
      return contratoMaestroId.at(0);

    } catch (error) {
      handleExeptions(error);
    }
  }

  async delete(id: string) {
    try {
      const proveedor = await this.findOne(id);
      if (proveedor) {
        await this.proveedorRepository.delete(id);
        return { message: 'Proveedor eliminado exitosamente' };
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  // async emitter(proveedor: Proveedor, evento: string) {
  //   this.eventEmitter.emit(
  //     `proveedor.${evento}`,
  //     new ProveedorEvent({ proveedor }),
  //   )
  // }

}
