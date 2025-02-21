import { ValidRoles } from "../interfaces/usuarios.roles";
import { ValidPermises } from "../interfaces/usuarios.permisos";
import {
    IsArray, IsBoolean, IsEmail, IsEnum,
    IsOptional, IsString, IsUUID, MaxLength
} from "class-validator";
import { TipoDeDocumento } from "../interfaces/usuarios.tipo-de-documento";
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
    @IsEnum(ValidRoles)
    rol: ValidRoles;

    @IsOptional()
    @IsArray()
    @IsEnum(ValidPermises, { each: true })
    permisos: ValidPermises[];

    @IsOptional()
    @IsEnum(TipoDeDocumento, { each: true })
    documentosDeFirma: TipoDeDocumento[];

    @IsOptional()
    @IsEnum(TIPO_DE_SERVICIO, { each: true })
    tipoOrdenDeServicio: TIPO_DE_SERVICIO[];
}