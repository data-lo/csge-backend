import { IsBoolean, IsEnum, IsOptional, IsUUID } from "class-validator";
import { TipoDeDocumento } from "src/administracion/usuarios/interfaces/usuarios.tipo-de-documento";

export class CreateFirmaDto {

    @IsUUID()
    ordenOFacturaId:string;

    @IsBoolean()
    @IsOptional()
    estaFirmado:boolean;

    @IsEnum(TipoDeDocumento)
    tipoDeDocumento:TipoDeDocumento
}
