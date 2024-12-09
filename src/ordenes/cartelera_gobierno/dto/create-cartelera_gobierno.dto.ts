import { IsString } from "class-validator";
import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export class CreateCarteleraGobiernoDto {
    
    @IsString()
    ubicacion:string;

    @IsString()
    numeroDeInventario:string;

    @IsString()
    clave:string;

    @IsString()
    ruta:string;

    @IsString()
    medida:string;

    @IsString()
    metrosCuadrados:string;

    @CreateDateColumn({
        name:'creado_en'
    })
    creadoEn:Date;

    @UpdateDateColumn({
        name:'actualizado_en'
    })
    actualizadoEn:Date;
}
