import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { Repository } from 'typeorm';
import { Municipio } from './entities/municipio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { handleExeptions } from '../../helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';

@Injectable()
export class MunicipioService {

  constructor(
    @InjectRepository(Municipio)
    private municipioRepository:Repository<Municipio>
  ){}

  async create(createMunicipioDto: CreateMunicipioDto) {
    try{
      const municipio = this.municipioRepository.create(createMunicipioDto);
      await this.municipioRepository.save(municipio);
      return municipio;
    }catch(error:any){
      handleExeptions(error)
    }
  }

  async findAll( pagina:number) {
    try{
      const paginationSetter = new PaginationSetter();
      const municipios = await this.municipioRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina)
      });
      return municipios;
    }catch(error:any){
      handleExeptions(error)
    }
  }

  async findOne(id: string) {
    try{
      const municipio = await this.municipioRepository.findOne({
        where:{id:id}
      });
      if(!municipio) throw new NotFoundException('Municipio no encontrado');
      return municipio;
    }catch(error:any){
      handleExeptions(error)
    }
  }

  async update(id: string, updateMunicipioDto: UpdateMunicipioDto) {
    try{
      const municipio = await this.findOne(id);
      if(!municipio) throw new NotFoundException('Municipio no encontrado');
      await this.municipioRepository.update(id,updateMunicipioDto);
      return await this.municipioRepository.findOneBy({id:id});
    }catch(error:any){
      handleExeptions(error)
    }
  }

  async remove(id: string) {
    try{
      const municipio = await this.findOne(id);
      if(!municipio) throw new NotFoundException('Municipio no encontrado');
      await this.municipioRepository.delete(id);
      return {message:'Municipio Eliminado con exito'};
    }catch(error:any){
      handleExeptions(error)
    }
  }

  async esFrontera(id:string){
    try{
      const municipio = await this.findOne(id);
      if(municipio.frontera) return {esfrontera:true};
      return {esfrontera:false};
    }catch(error:any){
      handleExeptions(error);
    }
  }
}
