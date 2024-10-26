import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRespFirmaDto } from './dto/create-resp_firma.dto';
import { UpdateRespFirmaDto } from './dto/update-resp_firma.dto';
import { Repository } from 'typeorm';
import { ResponsableFirma } from './entities/resp_firma.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuariosService } from '../../administracion/usuarios/usuarios.service';
import { ValidPermises } from '../../administracion/usuarios/interfaces/usuarios.permisos';
import { handleExeptions } from '../../helpers/handleExceptions.function';
import { AgregarResponsableDto } from './dto/agregar-resposnable.dto';
import { EliminarResponsableDto } from './dto/eliminar-responsable.dto';
import { TipoDeDocumento } from './interfaces/tipo-de-documento';


@Injectable()
export class RespFirmaService {
  constructor(
    @InjectRepository(ResponsableFirma)
    private responsableFirmaRepository:Repository<ResponsableFirma>,
    private usuariosService:UsuariosService
  ){}
  
  
  async exsiteDocumentoFacturaYCampanias(tipoDeDocumento:TipoDeDocumento){
    const existeDocumento = await this.responsableFirmaRepository.findOne({
      where:{tipoDeDocumento:tipoDeDocumento}
    })
    
    if(existeDocumento){
      const tipoDeDocumento = existeDocumento.tipoDeDocumento;
      if(tipoDeDocumento === TipoDeDocumento.ORDEN_DE_SERVICIO){
        return false;
      }
      throw new BadRequestException('El documento ya existe, modificar responsables');
    }else{
      return false;
    }
  }

  async obtenerUsuarios(responsables:string[]){  
      const usuariosDB = await Promise.all(
        responsables.map(async (responsableId) => {
          const usuarioDb = await this.usuariosService.findOne(responsableId);
          if(usuarioDb && usuarioDb.estatus && usuarioDb.permisos.includes(ValidPermises.FIRMA)){
            return usuarioDb;
          }else{
            throw new BadRequestException(`El usuario ${usuarioDb.id}, ${usuarioDb.nombres} ${usuarioDb.primerApellido} no cuenta con permiso de firma`)
          }
       })
      )
      const usuariosFiltrados = usuariosDB.filter(usuario => usuario !== null,);
      return usuariosFiltrados;
  }

  async create(createRespFirmaDto: CreateRespFirmaDto) {
    try{
      const {responsables,...rest} = createRespFirmaDto;

      const existeDocumento = await this.exsiteDocumentoFacturaYCampanias(createRespFirmaDto.tipoDeDocumento)

      if(!existeDocumento){
        
        const responsablesValidados = await this.obtenerUsuarios(responsables);
        const responsablesFirma = this.responsableFirmaRepository.create({
          responsables:responsablesValidados,
          ...rest
        });
        await this.responsableFirmaRepository.save(responsablesFirma);
        return responsablesFirma;  
      }else{
        throw new BadRequestException('Error al crear el responsale');
      }
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
        throw new NotFoundException('No se encontró el documento de responsables');
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
        throw new NotFoundException(`No se enucuentra id del documento a actualizar`);
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
      const {usuarioId, responsableFirmaId} = eliminarResponsableDto;
      const responsableFirma = await this.findOne(responsableFirmaId);
      const responsableIndex = responsableFirma.responsables.findIndex((responsable)=>{
        responsable.id === usuarioId;
      });

      responsableFirma.responsables.splice(responsableIndex,1);
      await this.responsableFirmaRepository.save(responsableFirma);

      return {message:'Responsable eliminado exitosamente'};
    }
    catch(error){
      handleExeptions(error);
    }
  }
}
