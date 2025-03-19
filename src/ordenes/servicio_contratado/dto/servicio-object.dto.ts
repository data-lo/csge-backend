import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ServicioObjectDto {

    @IsOptional()
    @IsString()
    nombreDeServicio: string;

    @IsOptional()
    @IsString()
    TIPO_DE_SERVICIO: string;

    @IsOptional()
    @IsString()
    descripcionDelServicio: string;

    @IsOptional()
    @IsString()
    nombreFormato: string;

    @IsOptional()
    @IsString()
    tipoFormato: string;

    @IsOptional()
    @IsString()
    tarifaUnitaria: string;

    @IsOptional()
    @IsString()
    iva: string;

    @IsOptional()
    @IsBoolean()
    ivaIncluido: boolean;

    @IsOptional()
    @IsBoolean()
    ivaFrontera: boolean
}