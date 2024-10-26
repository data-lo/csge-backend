import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTiempoDto } from './dto/create-tiempo.dto';
import { UpdateTiempoDto } from './dto/update-tiempo.dto';
import { handleExeptions } from '../../helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Tiempo } from './entities/tiempo.entity';
import { Repository } from 'typeorm';
import { PaginationSetter } from '../../helpers/pagination.getter';

@Injectable()
export class TiemposService {
  constructor(
    @InjectRepository(Tiempo)
    private tiempoRepository:Repository<Tiempo>
  ){}
  
  async create(createTiempoDto: CreateTiempoDto) {
    try{
      const tiempo = this.tiempoRepository.create(createTiempoDto);
      await this.tiempoRepository.save(tiempo);
      return tiempo;
    }catch(error:any){
      handleExeptions(error)
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const tiempos = await this.tiempoRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina)
      });
      return tiempos;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const tiempo = await this.tiempoRepository.findOne({
        where:{id:id}
      })
      if(!tiempo){
        throw new NotFoundException('No se encuentra la unidad de tiempo');
      }
      return tiempo;
    }catch(error:any){
      handleExeptions(error)
    }
  }

  async update(id: string, updateTiempoDto: UpdateTiempoDto) {
    try{
      const tiempoDb = await this.findOne(id);
      if(tiempoDb){
        await this.tiempoRepository.update(id,updateTiempoDto);
        return await this.findOne(id);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      const longitudDb = await this.findOne(id);
      if(longitudDb){
        await this.tiempoRepository.delete(id);
        return {message:'Unidad de tiempo Eliminada Correctamente'}
      }
    }catch(error){
      handleExeptions(error);
    }
  }
}
