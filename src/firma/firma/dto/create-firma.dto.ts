import { IsBoolean, IsEnum, IsOptional, IsUUID } from "class-validator";
import { TIPO_DE_DOCUMENTO } from "src/administracion/usuarios/interfaces/usuarios.tipo-de-documento";

export class CreateFirmaDto {

    @IsUUID()
    documentId: string;

    @IsBoolean()
    @IsOptional()
    estaFirmado: boolean;

    @IsEnum(TIPO_DE_DOCUMENTO)
    documentType: TIPO_DE_DOCUMENTO

    @IsOptional()
    @IsUUID()
    activationId?: string;
}
