import { join } from 'path'
import { existsSync, readdirSync, unlinkSync } from 'fs';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ImagenService {
  
  private readonly rutaDeCarga = join(__dirname,'../../static/uploads');
  
  getImagen(){
    const imagen = readdirSync(this.rutaDeCarga)
    if(imagen.length === 0){
      return null;
    }
    return join(this.rutaDeCarga,imagen[0]);
  }

  eliminarImagenExistente(){
    const imagenesCargadas = readdirSync(this.rutaDeCarga);
    if(imagenesCargadas.length > 0){
      const rutaDeImagenCargada = join(this.rutaDeCarga,imagenesCargadas[0]);
      if(existsSync(rutaDeImagenCargada)){
        unlinkSync(rutaDeImagenCargada);
      }
    }
  }
}


