import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ServicioDto {
    
    @IsOptional()
    @IsString()
    nombreDeServicio:string;
    
    @IsOptional()
    @IsString()
    tipoDeServicio:string;
    
    @IsOptional()
    @IsString()
    descripcionDelServicio:string;
    
    @IsOptional()
    @IsString()
    nombreFormato:string;

    @IsOptional()
    @IsString()
    tipoFormato:string;

    @IsOptional()
    @IsString()
    tarifaUnitaria:string;

    @IsOptional()
    @IsString()
    iva:string;
    
    @IsOptional()
    @IsBoolean()
    ivaIncluido:boolean;

    @IsOptional()
    @IsBoolean()
    ivaFrontera:boolean
}