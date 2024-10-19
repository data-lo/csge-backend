import { join } from 'path'
import { existsSync, readdirSync, unlinkSync } from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImagenService{
  private readonly rutaDeCarga = join(__dirname,'../../../static/uploads/imagen');
  getImagen(){
    const imagen = readdirSync(this.rutaDeCarga)
    if(imagen.length === 0){
      return null;
    }
    return join(this.rutaDeCarga,imagen[0]);
  }


  eliminarImagenExistente(){
    console.log('aqui');
    const imagenesCargadas = readdirSync(this.rutaDeCarga);

    if(imagenesCargadas.length = 1){
      const rutaDeImagenCargada = join(this.rutaDeCarga,imagenesCargadas[0]);
      if(existsSync(rutaDeImagenCargada)){
        unlinkSync(rutaDeImagenCargada);
      }
    }else{
      return;
    }
  }
}

//C:\datalo-projects\sw-csge-2024\back-end\csge-backend\static\uploads