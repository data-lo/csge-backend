import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";
import { TipoDeDocumento } from "../interfaces/tipo-de-documento";
import { Type } from 'class-transformer';


export class CreateRespFirmaDto {
    
    @IsEnum(TipoDeDocumento)
    tipoDeDocumento:TipoDeDocumento
    
    @IsOptional()
    @IsArray()
    @IsEnum(TipoDeServicio,{each:true})
    tipoDeServicio:TipoDeServicio[]

    @IsArray()
    responsables:string[]
}
