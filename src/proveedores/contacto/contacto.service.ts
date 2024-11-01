import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contacto } from './entities/contacto.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { EstacionService } from '../estacion/estacion.service';

@Injectable()
export class ContactoService {

  constructor(
    @InjectRepository(Contacto)
    private contactoRepository:Repository<Contacto>,
    private estacionService:EstacionService
  ){}

  async create(createContactoDto: CreateContactoDto) {
    try{
      const {estacionId, ...rest} = createContactoDto;
      const estacionDb = await this.estacionService.findOne(estacionId);
      const contacto = this.contactoRepository.create({
        estacion:estacionDb,
        ...rest
      });
      await this.contactoRepository.save(contacto);
      return contacto;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const contactos = await this.contactoRepository.find({
        skip:paginationSetter.getSkipElements(pagina),
        take:paginationSetter.castPaginationLimit()
      });
      return contactos;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const contacto = await this.contactoRepository.findOne({
        where:{id:id}
      });
      if(!contacto) throw new NotFoundException('No se encuentra el contacto');
      return contacto;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async update(id: string, updateContactoDto: UpdateContactoDto) {
    try{
      const contacto = await this.findOne(id);
      if(contacto){
        await this.contactoRepository.update(id,updateContactoDto);
        return await this.findOne(id);
      }
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      const contacto = await this.findOne(id);
      if(contacto){
        await this.contactoRepository.delete(id);
        return {message:'Contacto eliminado correctamente'};
      }
    }catch(error:any){
      handleExeptions(error);
    }
  }
}
