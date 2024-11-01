import { IsEmail, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateContactoDto {
    
    @IsString()
    @IsOptional()
    nombre:string;

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
}
