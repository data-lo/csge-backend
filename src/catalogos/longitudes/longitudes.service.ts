import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLongitudDto } from './dto/create-longitud.dto';
import { UpdateLongitudDto } from './dto/update-longitud.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Longitud } from './entities/longitud.entity';
import { handleExceptions } from '../../helpers/handleExceptions.function';
import { PaginationSetter } from '../../helpers/pagination.getter';

@Injectable()
export class LongitudesService {

  constructor(
    @InjectRepository(Longitud)
    private longitudRepository:Repository<Longitud>
  ){}

  async create(createLongitudeDto: CreateLongitudDto) {
    try{
      const longitud = this.longitudRepository.create(createLongitudeDto)
      await this.longitudRepository.save(longitud);
      return longitud;
    }catch(error){
      handleExceptions(error);
    }
  }

  async findAll() {
    try{
      const longitudes = await this.longitudRepository.find({});
      return longitudes;
    }catch(error){
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const longitud = await this.longitudRepository.findOneBy({
        id:id
      })
      if(!longitud){
        throw new NotFoundException('No se encuentra la longitud')
      }
      return longitud;
    }catch(error:any){
      handleExceptions(error);
    }
  }

  async findOneByUnidad(term:string){
    try{
      const longitud = await this.longitudRepository.findOneBy({unidad:term});
      if(!longitud) throw new NotFoundException('La Longitud no se encuentra');
      return longitud;
    }catch(error:any){
      handleExceptions(error);
    }
  }

  async update(id: string, updateLongitudeDto: UpdateLongitudDto) {
    try{
      const longitudDb = await this.findOne(id);
      if(longitudDb){
        await this.longitudRepository.update(id,updateLongitudeDto);
        return await this.findOne(id);
      }
    }catch(error){
      handleExceptions(error);
    }
  }

  async remove(id: string) {
    try{
      const longitudDb = await this.findOne(id);
      if(longitudDb){
        await this.longitudRepository.delete(id);
        return {message:'Longitud Eliminada Correctamente'}
      }
    }catch(error){
      handleExceptions(error);
    }
  }
}
