import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartidaDto } from './dto/create-partida.dto';
import { UpdatePartidaDto } from './dto/update-partida.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partida } from './entities/partida.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';

@Injectable()
export class PartidaService {
  

  constructor(
    @InjectRepository(Partida)
    private partidaRepository:Repository<Partida>
  ){}
  
  
  async create(createPartidaDto: CreatePartidaDto) {
    try{
      const partida = this.partidaRepository.create(createPartidaDto);
      await this.partidaRepository.save(partida);
      return partida;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const partidas = await this.partidaRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina)
      });
      return partidas;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const partida = await this.partidaRepository.findOne({
        where:{id:id},
      });
      if(!partida) throw new NotFoundException('La partida no exisite');
      return partida;
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(id: string, updatePartidaDto: UpdatePartidaDto) {
    try{
      const partida = await this.findOne(id);
      if(partida){
        await this.partidaRepository.update(id,updatePartidaDto);
        return await this.findOne(id);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async desactivarPartida(id:string){
    try{
      console.log('here');
      const partida = await this.findOne(id);
      partida.estatus = false;
      await this.partidaRepository.save(partida);
      return await this.findOne(id);
    }catch(error){
      handleExeptions(error);
    }
  }

  async obtenerEstatus(id:string){
    try{
      const partida = await this.findOne(id);
      return {id: partida.id, estatus:partida.estatus};
    }catch(error){
      handleExeptions(error);
    }
  }

  async obtenerMontos(id:string){
    try{
      const partida = await this.findOne(id);
      return {
        montoActivo:partida.montoActivo,
        montoEjercido:partida.montoEjercido,
        montoPagado:partida.montoPagado
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async delete(id:string){
    try{
      const partida = await this.findOne(id);
      if(partida){
        await this.partidaRepository.delete(id);
        return {message:'Partida eliminada exitosamente'};
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async actualizarMontos(){
    try{
//utilizar las ordenes de servicio
    }catch(error){
      handleExeptions(error);
    }
  }
}
