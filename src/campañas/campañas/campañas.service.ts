import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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


@Injectable()
export class CampañasService {

  constructor(
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
        order:{
          activaciones:{
            fechaDeAprobacion:'DESC'
          }
        }
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
          activaciones:{partida:true},
          dependencias:true
        }
      });
      if(!campaña) throw new NotFoundException('Campaña no encontrada');
      return campaña;
    }catch(error){
      handleExeptions(error);
    }
  }

  async cancelarCampaña(id:string){
    try{
      const estatusCampaña = await this.verificarEstatus(id);
      if(estatusCampaña.estatus === (EstatusCampaña.CREADA || EstatusCampaña.COTIZANDO)){
        throw new BadRequestException('La campaña no puede ser cancelada bajo este estatus, eliminar o modificar campaña');
      }
      await this.campañaRepository.update(id,{
        estatus:EstatusCampaña.INACTIVA
      });
      return await this.findOne(id);
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(id: string, updateCampañaDto: UpdateCampañaDto) {
    try{
      const estatus = (await this.verificarEstatus(id)).estatus;
      console.log(estatus);
      if(estatus === EstatusCampaña.CREADA || estatus === EstatusCampaña.COTIZANDO){
        await this.campañaRepository.update(id,updateCampañaDto);
        return this.findOne(id);  
      }
      throw new BadRequestException('Estatus de campaña no valido para actualizar, cancelar campaña');
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      const estatus = (await this.verificarEstatus(id)).estatus;
      if((estatus === EstatusCampaña.CREADA) || (estatus === EstatusCampaña.COTIZANDO)){
        await this.campañaRepository.delete(id);
        return {message:'Campaña eliminada existosamente'};
      }
      throw new BadRequestException('Estatus de campaña no valido para eliminar, cancelar campaña');
    }catch(error){
      handleExeptions(error);
    }
  }

  async verificarEstatus(id:string){
    try{
      const campaña = await this.campañaRepository.findOneBy({id:id});
      if(!campaña) throw new NotFoundException('No se encuentra la campaña');
      return {id:campaña.id,estatus:campaña.estatus};
    }catch(error){
      handleExeptions(error);
    }
  }

  async agregarActivacion(id:string, createActivacionDto:CreateActivacionDto){
    try{ 
      const estatus = (await this.verificarEstatus(id)).estatus;
      if(estatus !== EstatusCampaña.INACTIVA){
        throw new BadRequestException('Estatus de campaña no valido para reactivar, estatus valido: INACTIVA');
      }
      const activaciones = (await this.findOne(id)).activaciones;
      const index = activaciones.length;
    
      const ultimaActivacion = activaciones[index-1];

      await this.activacionService.desactivar(ultimaActivacion.id);
      const {partida, ...rest} = createActivacionDto;

      const partidaDb = await this.partidaService.create(partida);
      rest.campañaId = id;
      rest.partidaId = partidaDb.id;
      
      const activacionDb = await this.activacionService.create({
        partida:partidaDb,
        ...rest
      });

      if(activacionDb){
        await this.campañaRepository.update(id,{estatus:EstatusCampaña.REACTIVADA});
      }
      
      return {message:'campaña reactivada exitosamente',activacion:activacionDb};
      
    }catch(error){
      handleExeptions(error);
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

}
