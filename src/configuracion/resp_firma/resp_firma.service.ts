import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRespFirmaDto } from './dto/create-resp_firma.dto';
import { UpdateRespFirmaDto } from './dto/update-resp_firma.dto';
import { Repository } from 'typeorm';
import { ResponsableFirma } from './entities/resp_firma.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuariosService } from 'src/administracion/usuarios/usuarios.service';
import { ValidPermises } from 'src/administracion/usuarios/interfaces/usuarios.permisos';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { AgregarResponsableDto } from './dto/agregar-resposnable.dto';
import { EliminarResponsableDto } from './dto/eliminar-responsable.dto';


@Injectable()
export class RespFirmaService {
  constructor(
    @InjectRepository(ResponsableFirma)
    private responsableFirmaRepository:Repository<ResponsableFirma>,
    private usuariosService:UsuariosService
  ){}
  
  
  async obtenerUsuarios(responsables:string[]){  
      const usuariosDB = await Promise.all(
        responsables.map(async (responsableId) => {
          const usuarioDb = await this.usuariosService.findOne(responsableId);
          if(usuarioDb && usuarioDb.estatus && usuarioDb.permisos.includes(ValidPermises.FIRMA)){
            return usuarioDb;
          }
          return null;
       })
      )

      const usuariosFiltrados = usuariosDB.filter(usuario => usuario !== null);
      return usuariosFiltrados;
  }

  async create(createRespFirmaDto: CreateRespFirmaDto) {
    try{
      const {responsables,...rest} = createRespFirmaDto;
      const responsablesValidados = await this.obtenerUsuarios(responsables);
      const responsablesFirma = this.responsableFirmaRepository.create({
        responsables:responsablesValidados,
        ...rest
      });

    await this.responsableFirmaRepository.save(responsablesFirma);
    return responsablesFirma;
    
    }catch(error){
      handleExeptions(error);
    }
  }
    
  async findAll(){
    try{
      const responsables = await this.responsableFirmaRepository.find({
        relations:{
          responsables:true
        },select:{
          id:true,
          tipoDeDocumento:true,
          tipoDeServicio:true,
          responsables:{
            id:true
          }
        }
      });
      return responsables;
    }catch(error){
      handleExeptions(error);
    }
  }

  findOne(id:string) {
    try{
      const responsables = this.responsableFirmaRepository.findOne({
        where:{
          id:id
        },relations:{
          responsables:true
        },select:{
          id:true,
          tipoDeDocumento:true,
          tipoDeServicio:true,
          responsables:{
            id:true
          }
        }
      });
      if(!responsables){
        throw new BadRequestException('No se encontró el documento de responsables');
      }
      return responsables;
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(id: string, updateRespFirmaDto: UpdateRespFirmaDto) {
    
    try{
      
      const {responsables, ...rest} = updateRespFirmaDto;
      const responsableFirma = await this.findOne(id);
      
      if(!responsableFirma){
        throw new Error('No se encontro el resposnable de firma');
      }
      
      const usuarios = await this.obtenerUsuarios(responsables);
      responsableFirma.responsables = usuarios;
      Object.assign(responsableFirma,rest);

      const responsableModificado = await this.responsableFirmaRepository.save(
        responsableFirma
      );
      
      return responsableModificado;
    
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      const responsableFirma = await this.findOne(id);
      responsableFirma.responsables = [];
      await this.responsableFirmaRepository.save(responsableFirma);
      await this.responsableFirmaRepository.remove(responsableFirma);
      return {
        message:'Responsables Eliminados'
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async agregarResponsable(agregarResponsableDto:AgregarResponsableDto){
    try{
      const { usuarioId, responsableFirmaId} = agregarResponsableDto;
      const responsableFirma = await this.findOne(responsableFirmaId);
      const usuario = (await this.obtenerUsuarios([usuarioId])).at(0);
      
      if(responsableFirma.responsables.some(responsable => responsable.id === usuarioId)){
        throw new BadRequestException('El usuario ya es responsable de firmar este documento');
      }
      responsableFirma.responsables.push(usuario);
      await this.responsableFirmaRepository.save(responsableFirma);
      return responsableFirma;
    }
    catch(error){
      handleExeptions(error);
    }
  }

  async eliminarResponsable(eliminarResponsableDto:EliminarResponsableDto){
    try{
    }
    catch(error){
      handleExeptions(error);
    }
  }
}
