import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { TIPO_DE_SERVICIO } from "src/contratos/interfaces/tipo-de-servicio";

export class CreateServicioDto {

    @IsEnum(TIPO_DE_SERVICIO)
    tipoDeServicio: TIPO_DE_SERVICIO;

    @IsString()
    nombreDeServicio: string;

    @IsBoolean()
    @IsOptional()
    estatus: boolean;

    @IsUUID()
    @IsString()
    estacionId: string;
}
