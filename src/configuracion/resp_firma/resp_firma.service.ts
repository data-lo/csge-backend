import { Injectable } from '@nestjs/common';
import { CreateRespFirmaDto } from './dto/create-resp_firma.dto';
import { UpdateRespFirmaDto } from './dto/update-resp_firma.dto';
import { Repository } from 'typeorm';
import { ResponsableFirma } from './entities/resp_firma.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuariosService } from 'src/administracion/usuarios/usuarios.service';

@Injectable()
export class RespFirmaService {
  constructor(
    @InjectRepository(ResponsableFirma)
    private responsableFirmaRepository:Repository<ResponsableFirma>,
    private usuariosService:UsuariosService
  ){}
  
  
  async create(createRespFirmaDto: CreateRespFirmaDto) {
    const {responsables,...rest} = createRespFirmaDto;
    
    const usuariosDB = await Promise.all(
      responsables.map(async (responsableId) => {
        const usuarioDb = await this.usuariosService.findOne(responsableId);
        if(usuarioDb && usuarioDb.estatus){
          return usuarioDb;
        }
        return null;
      })
    )

    const usuariosFiltrados = usuariosDB.filter(usuario => usuario !== null);
    const responsablesFirma = this.responsableFirmaRepository.create({
      responsables:usuariosFiltrados,
      ...rest
    });

    await this.responsableFirmaRepository.save(responsablesFirma);
    return responsablesFirma;
  }

  findAll() {
    return `This action returns all respFirma`;
  }

  findOne(id: number) {
    return `This action returns a #${id} respFirma`;
  }

  update(id: number, updateRespFirmaDto: UpdateRespFirmaDto) {
    return `This action updates a #${id} respFirma`;
  }

  remove(id: number) {
    return `This action removes a #${id} respFirma`;
  }
}
