import { IsEmail, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateContactoDto {
    
    @IsString()
    @IsOptional()
    nombreContacto:string;

    @IsString()
    @IsOptional()
    telefono:string;

    @IsString()
    @IsOptional()
    @IsEmail()
    correoElectronico:string;

    @IsString()
    @IsOptional()
    observaciones:string;

    @IsString()
    @IsOptional()
    @IsUUID()
    estacionId:string;

    @IsString()
    @IsOptional()
    @IsUUID()
    proveedorId:string;
}
