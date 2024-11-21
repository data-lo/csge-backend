import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contacto } from './entities/contacto.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { EstacionService } from '../estacion/estacion.service';
import { ProveedorService } from '../proveedor/proveedor.service';

@Injectable()
export class ContactoService {
  constructor(
    @InjectRepository(Contacto)
    private contactoRepository: Repository<Contacto>,
    private estacionService: EstacionService,
    private proveedorService: ProveedorService,
  ) {}

  async create(createContactoDto: CreateContactoDto) {
    try {
      const { estacionId, proveedorId, ...rest } = createContactoDto;
      let estacionDb = null;
      let proveedorDb = null;
      if (estacionId) {
        estacionDb = await this.estacionService.findOne(estacionId);
      }
      if (proveedorId) {
        proveedorDb = await this.proveedorService.findOne(proveedorId);
      }
      const contacto = this.contactoRepository.create({
        estacion: estacionDb,
        proveedor: proveedorDb,
        ...rest,
      });
      await this.contactoRepository.save(contacto);
      return contacto;
    } catch (error: any) {
      handleExeptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter();
      const contactos = await this.contactoRepository.find({
        skip: paginationSetter.getSkipElements(pagina),
        take: paginationSetter.castPaginationLimit(),
      });
      return contactos;
    } catch (error: any) {
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const contacto = await this.contactoRepository.findOne({
        where: { id: id },
      });
      if (!contacto) throw new NotFoundException('No se encuentra el contacto');
      return contacto;
    } catch (error: any) {
      handleExeptions(error);
    }
  }

  async update(id: string, updateContactoDto: UpdateContactoDto) {
    try {
      const contacto = await this.findOne(id);
      if (!contacto) throw new NotFoundException('No se encuentra el contacto');
      const { proveedorId, estacionId } = updateContactoDto;
      let proveedorDb = null;
      let estacionDb = null;

      if (proveedorId) {
        proveedorDb = await this.proveedorService.findOne(proveedorId);
      }

      if (estacionId) {
        estacionDb = await this.estacionService.findOne(proveedorId);
      }

      await this.contactoRepository.update(id, {
        proveedor: proveedorDb,
        estacion: estacionDb,
        ...updateContactoDto,
      });

      return await this.findOne(id);
    } catch (error: any) {
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try {
      const contacto = await this.findOne(id);
      if (contacto) {
        await this.contactoRepository.delete(id);
        return { message: 'Contacto eliminado correctamente' };
      }
    } catch (error: any) {
      handleExeptions(error);
    }
  }
}
