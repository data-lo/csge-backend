import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartidaDto } from './dto/create-partida.dto';
import { UpdatePartidaDto } from './dto/update-partida.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partida } from './entities/partida.entity';
import { Repository, ReturnDocument } from 'typeorm';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { Campaña } from '../campañas/entities/campaña.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { timeStamp } from 'console';

@Injectable()
export class PartidaService {
  constructor(
    
    @InjectRepository(Partida)
    private matchRepository:Repository<Partida>,
    
    @InjectRepository(Campaña)
    private campañaRepository:Repository<Campaña>,
    
    @InjectRepository(Orden)
    private ordenRepository:Repository<Orden>

  ){}
  
  
  async create(createPartidaDto: CreatePartidaDto) {
    try{
      const match = this.matchRepository.create(createPartidaDto);

      await this.matchRepository.save(match);

      return match;
    }catch(error){
      handleExceptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const partidas = await this.matchRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina)
      });
      return partidas;
    }catch(error){
      handleExceptions(error);
    }
  }

  async findOne(partidaId: string) {
    try{
      const partida = await this.matchRepository.findOne({
        where:{id:partidaId},
      });
      if(!partida) throw new NotFoundException('La partida no exisite');
      return partida;
    }catch(error){
      handleExceptions(error);
    }
  }

  async update(partidaId: string, updatePartidaDto: UpdatePartidaDto) {
    try{
      const partidaDb = await this.matchRepository.findOne({
        where:{id:partidaId}
      });  
      if(!partidaDb) throw new NotFoundException('No se encuentra la partida');
      Object.assign(partidaDb,updatePartidaDto)
      await this.matchRepository.save(partidaDb);
      return {message:'Partida actualziada correctamente'};
    }catch(error){
      handleExceptions(error);
    }
  }

  async desactivarPartida(partidaId:string){
    try{
      const partidaDb = await this.matchRepository.findOneBy({id:partidaId})
      partidaDb.estatus = false;
      await this.matchRepository.save(partidaDb);
      return {message:'Partida desactivada correctamente'};
    }catch(error){
      handleExceptions(error);
    }
  }

  async obtenerEstatus(id:string){
    try{
      const partida = await this.findOne(id);
      return {id: partida.id, estatus:partida.estatus};
    }catch(error){
      handleExceptions(error);
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
      handleExceptions(error);
    }
  }

  async remove(id:string){
    try{
      const partidaDb = await this.matchRepository.findOneBy({id:id});
      if(!partidaDb) throw new NotFoundException('No se encuentra la partida');
      await this.matchRepository.remove(partidaDb);
      return {message:'Partida eliminada exitosamente'};
    }catch(error){
      handleExceptions(error);
    }
  }

  async actualizarMontos(ordenId:string,evento:string){
    try{

      const ordenDb = await this.ordenRepository.findOne({
          where:{id:ordenId},
          relations:{campaña:true}
        }
      );

      const campania = await this.campañaRepository.findOne({
        where:{id:ordenDb.campaña.id},
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
          partidaDb.montoActivo = (partidaDb.montoActivo + ordenDb.total);
          break;
        case 'orden.canelada':   
          partidaDb.montoActivo = (partidaDb.montoActivo - ordenDb.total);
          break;
        
        case 'orden.cotejada':
          partidaDb.montoActivo = (partidaDb.montoActivo - ordenDb.total);
          partidaDb.montoEjercido = (partidaDb.montoEjercido + ordenDb.total);
          break;
        
        case 'factura.pagada':
          partidaDb.montoPagado = (partidaDb.montoPagado = ordenDb.total);
          break;
        
        case 'factura.cancelada':
          partidaDb.montoPagado = (partidaDb.montoPagado - ordenDb.total);
          partidaDb.montoEjercido = (partidaDb.montoEjercido - ordenDb.total);
      }
      await this.matchRepository.save(partidaDb);
      return;

    }catch(error){
      handleExceptions(error);
    }
  }
}
