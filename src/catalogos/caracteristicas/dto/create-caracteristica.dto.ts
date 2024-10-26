import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateCaracteristicaDto {
    
    @IsUUID()
    @IsOptional()    
    unidad:string;
    
    @IsUUID()
    @IsOptional() 
    dimensiones:string;
    
    @IsUUID()
    @IsOptional()
    impresion:string;
    
    @IsUUID()
    @IsOptional()
    formato:string;
    
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
