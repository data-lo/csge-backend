import { VALID_ROLES } from "../interfaces/usuarios.roles";
import { ValidPermises } from "../interfaces/usuarios.permisos";
import {
    IsArray, IsBoolean, IsEmail, IsEnum,
    IsOptional, IsString, IsUUID, MaxLength
} from "class-validator";
import { TIPO_DE_DOCUMENTO } from "../interfaces/usuarios.tipo-de-documento";
import { TIPO_DE_SERVICIO } from "src/contratos/interfaces/tipo-de-servicio";

export class CreateUsuarioDto {

    @IsOptional()
    @IsBoolean()
    estatus: boolean;

    @IsString()
    @MaxLength(100)
    nombres: string;

    @IsString()
    @MaxLength(13)
    rfc: string;

    @IsString()
    @MaxLength(50)
    primerApellido: string;

    @IsString()
    @MaxLength(50)
    @IsOptional()
    segundoApellido: string;

    @IsUUID()
    @IsString()
    puestoId: string;

    @IsUUID()
    @IsString()
    departamentoId: string;

    @IsString()
    @IsEmail()
    correo: string;

    @IsString()
    @IsOptional()
    password: string;

    @IsString()
    numeroDeEmpleado: string;

    @IsOptional()
    @IsEnum(VALID_ROLES)
    rol: VALID_ROLES;

    @IsOptional()
    @IsArray()
    @IsEnum(ValidPermises, { each: true })
    permisos: ValidPermises[];

    @IsOptional()
    @IsEnum(TIPO_DE_DOCUMENTO, { each: true })
    documentosDeFirma: TIPO_DE_DOCUMENTO[];

    @IsOptional()
    @IsEnum(TIPO_DE_SERVICIO, { each: true })
    tipoOrdenDeServicio: TIPO_DE_SERVICIO[];
}