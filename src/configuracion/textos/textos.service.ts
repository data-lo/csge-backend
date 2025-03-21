import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTextoDto } from './dto/create-texto.dto';
import { UpdateTextoDto } from './dto/update-texto.dto';
import { Repository } from 'typeorm';
import { Texto } from './entities/texto.entity';
import { handleExceptions } from '../../helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { CamposDeTexto } from './interfaces/textos.campos';

@Injectable()
export class TextosService {
  constructor(
    @InjectRepository(Texto)
    private textosRepository:Repository<Texto>
  ){}

  async create(createTextoDto: CreateTextoDto) {
    try{
      const texto = this.textosRepository.create(createTextoDto);
      await this.textosRepository.save(texto);
      return texto;
    }catch(error){
      handleExceptions(error);
    }
    
  }

  async findAll() {
    try{
      return await this.textosRepository.find();
    }catch(error){
      handleExceptions(error);
    }
  }

  findOne(id:string) {
    try{
      const texto = this.textosRepository.findOneBy({id:id});
      return texto;
    }catch(error){
      handleExceptions(error)
    }
  }

  async update(id:string, updateTextoDto: UpdateTextoDto) {
    try{
      const textoActualizado = await this.textosRepository.update(id,updateTextoDto);
      if(textoActualizado.affected === 0){
        throw new NotFoundException('Texto no encontrado');
      }
      return this.findOne(id);
    }catch(error){
      handleExceptions(error);
    }
  }

  async obtenerEncabezado(){
    try{
      return await this.textosRepository.findOneBy({campo:CamposDeTexto.ENCABEZADO})
    }catch(error){
      handleExceptions(error);
    }
  }

  async obtenerPieDePagina(){
    try{
      return await this.textosRepository.findOneBy({campo:CamposDeTexto.PIE_DE_PAGINA})
    }catch(error){
      handleExceptions(error);
    }
  }

  async eliminarTexto(id:string) {
    try{
      const texto = ""
      await this.textosRepository.update(id,{texto:texto});
      return {message:"Texto eliminado"}
    }catch(error){
      handleExceptions(error);
    }
  }
}
