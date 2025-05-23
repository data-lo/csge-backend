import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFormatoDto } from './dto/create-formato.dto';
import { UpdateFormatoDto } from './dto/update-formato.dto';
import { handleExceptions } from '../../helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Formato } from './entities/formato.entity';
import { Repository } from 'typeorm';
import { PaginationSetter } from '../../helpers/pagination.getter';

@Injectable()
export class FormatosService {
  
  constructor(
    @InjectRepository(Formato)
    private formatoRepository:Repository<Formato>
  ){}
  
  async create(createFormatoDto: CreateFormatoDto) {
    try{
      const formato = this.formatoRepository.create(createFormatoDto);
      await this.formatoRepository.save(formato);
      return formato;
    }catch(error:any){
      handleExceptions(error);
    };
  }

  async findAll(){
    try{
      const formatos = await  this.formatoRepository.find();
      return formatos;
    }catch(error:any){
      handleExceptions(error);
    };
  }

  async findOne(id:string) {
    try{
      const formato = await this.formatoRepository.findOne({
        where:{id:id}
      });
      if(!formato) throw new NotFoundException('No se encotró el formato');
      return formato;
    }catch(error:any){
      handleExceptions(error);
    };
  }

  async update(id: string, updateFormatoDto: UpdateFormatoDto) {
    try{
      const formatoDb = await this.findOne(id);
      if(formatoDb){
        await this.formatoRepository.update(id,updateFormatoDto);
        return await this.findOne(id);
      }
    }catch(error:any){
      handleExceptions(error);
    };
  }

  async remove(id: string) {
    try{
      const formatoDb = await this.findOne(id);
      if(formatoDb){
        await this.formatoRepository.delete(id);
        return {message:'Formato eliminado correctamente'};
      }
    }catch(error:any){
      handleExceptions(error);
    };
  }
}
