import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { TipoProveedor } from "../interfaces/tipo-proveedor.interface";

export class CreateProveedorDto {
    
    @IsString()
    @MaxLength(18)
    numeroProveedor:string;

    //ordenDeServicio
    //OneToMany
    
    @IsString()
    @MaxLength(120)
    representanteLegal:string;

    @IsString()
    @IsOptional()
    nombreComercial:string;

    @IsEnum(TipoProveedor)
    tipoProveedor:TipoProveedor;

    @IsString()
    @MaxLength(13)
    @MinLength(12)
    rfc:string;
    
    @IsString()
    @MaxLength(100)
    razonSocial:string;

    @IsString()
    @MaxLength(200)
    domicilioFiscal:string;

    @IsString()
    @IsOptional()
    observacionesProveedor:string;

    @IsBoolean()
    @IsOptional()
    estatus:boolean;    
}
