import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCampañaDto } from './dto/create-campaña.dto';
import { UpdateCampañaDto } from './dto/update-campaña.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Campaña } from './entities/campaña.entity';
import { Repository } from 'typeorm';
import { Dependencia } from '../dependencia/entities/dependencia.entity';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { ActivacionService } from '../activacion/activacion.service';
import { PartidaService } from '../partida/partida.service';
import { EstatusCampaña } from './interfaces/estatus-campaña.enum';
import { CreateActivacionDto } from '../activacion/dto/create-activacion.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CampaniaEvent } from './interfaces/campaña-evento';


@Injectable()
export class CampañasService {

  constructor(

    private eventEmitter:EventEmitter2,

    @InjectRepository(Campaña)
    private campañaRepository:Repository<Campaña>,
    
    @InjectRepository(Dependencia)
    private dependeciaRepository:Repository<Dependencia>,
    private readonly activacionService:ActivacionService,
    private readonly partidaService:PartidaService,
  
  ){}

  async create(createCampañaDto: CreateCampañaDto) {
    try{
      let dependencias = [];
      const {dependenciasIds, activacion, partida, ...rest} = createCampañaDto;
    
      for(const dependenciaId of dependenciasIds){
        const dependencia = await this.dependeciaRepository.findOneBy({id:dependenciaId});
        if(!dependencia) throw new NotFoundException('No se encuentra la dependencia');
        dependencias.push(dependencia); 
      };

      const campaña = this.campañaRepository.create({
        dependencias:dependencias,
        ...rest
      });

      await this.campañaRepository.save(campaña);
      const partidaDb = await this.partidaService.create(partida);

      activacion.campañaId = campaña.id;
      activacion.partidaId = partidaDb.id;

      await this.activacionService.create(activacion);
      return campaña;

    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const campañas = await this.campañaRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina),
        relations:{
          dependencias:true,
          activaciones:true
        },select:{
          activaciones:{
            fechaDeAprobacion:true,
            fechaDeCierre:true,
            fechaDeCreacion:true,
            fechaDeInicio:true
          }
        },
      });
      return campañas;
    }catch(error){
      handleExeptions(error);
    }
  }


  async findAllBusuqueda() {
    try{
      const campañas = await this.campañaRepository.find({
        relations:{
          dependencias:true,
          activaciones:true
        },select:{
          activaciones:{
            fechaDeAprobacion:true,
            fechaDeCierre:true,
            fechaDeCreacion:true,
            fechaDeInicio:true
          }
        }
      });
      return campañas;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const campaña = await this.campañaRepository.findOne({
        where:{id:id},
        relations:{
          activaciones:{
            partida:true
          },
          dependencias:true
        }
      });
      if(!campaña) throw new NotFoundException('Campaña no encontrada');
      return campaña;
    }catch(error){
      handleExeptions(error);
    }
  }

  async cancelarCampaña(campañaId:string){
    try{
      const campañaDb = await this.campañaRepository.findOneBy({id:campañaId});
      if(!campañaDb) throw new NotFoundException('No se encuentra la campaña');
      if(campañaDb.estatus === (EstatusCampaña.CREADA || EstatusCampaña.COTIZANDO)){
        throw new BadRequestException('La campaña no puede ser cancelada bajo este estatus, eliminar o modificar campaña');
      }
      campañaDb.estatus = EstatusCampaña.CANCELADA;
      await this.campañaRepository.save(campañaDb);
      return {message:'Campaña cancelada exitosamente'};
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(campañaId: string, updateCampañaDto: UpdateCampañaDto) {
    try{
      const campañaDb = await this.campañaRepository.findOneBy({id:campañaId});
      if(!campañaDb) throw new NotFoundException('No se encuentra la campaña');
      if(campañaDb.estatus === EstatusCampaña.CREADA || campañaDb.estatus === EstatusCampaña.COTIZANDO){
        await this.campañaRepository.update(campañaId,updateCampañaDto);
        return {message:'Campaña actualizada exitosamente'};  
      }
      throw new BadRequestException('Estatus de campaña no valido para actualizar, cancelar campaña');
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(campaniaId: string) {
    try{
      const campaniaDb = await this.campañaRepository.findOne({
        where:{
          id:campaniaId
        },relations:{
          activaciones:{
            partida:true
          }
        }
      });
      if(!campaniaDb) throw new NotFoundException('No se encuentra la campaña');
      if((campaniaDb.estatus === EstatusCampaña.CREADA) || (campaniaDb.estatus === EstatusCampaña.COTIZANDO)){
        console.log('ejecutando metodo remove');
        await this.campañaRepository.remove(campaniaDb);
        return {message:'Campaña eliminada existosamente'};
      }
      throw new BadRequestException('Estatus de campaña no valido para eliminar, cancelar campaña');
    }catch(error){
      handleExeptions(error);
    }
  }

  async agregarActivacion(campañaId:string, createActivacionDto:CreateActivacionDto){
    try{ 
      const campañaDb = await this.campañaRepository.findOne({
        where:{id:campañaId},
        relations:{
          activaciones:true
        }
      })
      if(!campañaDb) throw new NotFoundException('No se encuentra la campaña');
      if(campañaDb.estatus !== EstatusCampaña.INACTIVA){
        throw new BadRequestException('Estatus de campaña no valido para reactivar, estatus valido: INACTIVA');
      }
      const activaciones = campañaDb.activaciones;
      const index = activaciones.length;
      const ultimaActivacion = activaciones[index-1];
      const activacionResponse = await this.activacionService.desactivar(ultimaActivacion.id);
      if(!activacionResponse.estatus) throw new InternalServerErrorException('Desactivacion de activacion fallido');
      
      const {partida, ...rest} = createActivacionDto;
      const partidaDb = await this.partidaService.create(partida);
      if(!partidaDb) throw new InternalServerErrorException('Creacion de nueva partida fallida');

      rest.campañaId = campañaDb.id;
      rest.partidaId = partidaDb.id;
      const activacionDb = await this.activacionService.create({
        partida:partidaDb,
        ...rest
      });

      if(!activacionDb) throw new InternalServerErrorException({message:'No se creo la activacion correctamente',partidaId:partidaDb.id});
      
      campañaDb.estatus = EstatusCampaña.REACTIVADA;
      await this.campañaRepository.save(campañaDb);
      return {message:'campaña reactivada exitosamente',activacion:activacionDb};
    }catch(error){
      //Si no se reactiva bien la campaña, eliminar las entidades creadas
      if(!error.partidaId){
        handleExeptions(error);
      }
      await this.partidaService.remove(error.partidaId)
      handleExeptions(error.message);
    }
  }

  async aprobarCampaña(id:string){


  }

  async actualizarEstatus(id:string,estatus:EstatusCampaña){
    try{
      const campaña = await this.findOne(id);
      campaña.estatus = estatus;
      await this.campañaRepository.update(id,{estatus:estatus});
      return campaña;
    }catch(error){
      handleExeptions(error);
    }
  }

  async emitter(campaña:Campaña,evento:string){
    this.eventEmitter.emit(
      `campania.${evento}`,
      new CampaniaEvent({campaña}),
    )
  }

}
