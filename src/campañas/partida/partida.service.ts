import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartidaDto } from './dto/create-partida.dto';
import { UpdatePartidaDto } from './dto/update-partida.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partida } from './entities/partida.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { Campaña } from '../campañas/entities/campaña.entity';

@Injectable()
export class PartidaService {
  constructor(
    @InjectRepository(Partida)
    private partidaRepository:Repository<Partida>,
    @InjectRepository(Campaña)
    private campañaRepository:Repository<Campaña>
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

  async actualizarMontos(campañaId:string,total:number,evento:string){
    try{
      const campania = await this.campañaRepository.findOne({
        where:{id:campañaId},
        relations:{
          activaciones:{
            partida:true
          }
        }
      });
      if(!campania) throw new NotFoundException('No se encuentra la campaña para actualizr los montos');
      const partidaDb = campania.activaciones.at(-1).partida;
      if(!partidaDb.estatus)throw new BadRequestException('Error, se esta tratando de actualizar una partida desactivada');
      
      // monto activo, orden aprobada
      // monto ejercido, cuando se coteja,
      // monto pagado, cuando se paga

      switch(evento){
        case 'orden.aprobada':
          console.log(partidaDb.montoActivo, total, 'ok');
          partidaDb.montoActivo = partidaDb.montoActivo + total;
          break;
        case 'orden.canelada':   
          partidaDb.montoActivo = partidaDb.montoActivo - total;
          break;
        
        case 'orden.cotejada':
          partidaDb.montoActivo = partidaDb.montoActivo - total;
          partidaDb.montoEjercido = partidaDb.montoEjercido + total;
          break;
        
        case 'factura.pagada':
          partidaDb.montoPagado = partidaDb.montoPagado = total;
          break;
        
        case 'factura.cancelada':
          partidaDb.montoPagado = partidaDb.montoPagado - total;
          partidaDb.montoEjercido = partidaDb.montoEjercido - total;
      }
      await this.partidaRepository.save(partidaDb);
      return;

    }catch(error){
      handleExeptions(error);
    }
  }
}
