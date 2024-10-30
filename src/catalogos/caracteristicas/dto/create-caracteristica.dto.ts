import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { TipoUnidad } from "../interfaces/tipo-unidad.interface";

export class CreateCaracteristicaDto {
    
    @IsUUID()
    @IsString()
    @IsOptional()    
    unidadId:string;

    @IsEnum(TipoUnidad)
    @IsOptional()
    tipoUnidad:TipoUnidad
    
    @IsUUID()
    @IsString()
    @IsOptional() 
    dimensionesId:string;
    
    @IsUUID()
    @IsString()
    @IsOptional()
    impresionId:string;
    
    @IsUUID()
    @IsString()
    @IsOptional()
    formatoId:string;

    @IsString()
    @IsOptional()
    pieza:string;
    
    @IsString()
    @IsOptional()
    paginasPrensa:string;
    
    @IsString()
    @IsOptional()
    seccionPrensa:string;
    
    @IsString()
    @IsOptional()
    webPublicacion:string;
    
    @IsString()
    @IsOptional()
    programa:string;
}
