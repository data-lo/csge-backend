import { IsBoolean, IsEnum, IsOptional, IsUUID,  } from "class-validator";
import { TIPO_DE_DOCUMENTO } from "src/administracion/usuarios/interfaces/usuarios.tipo-de-documento";
import { SIGNATURE_ACTION_ENUM } from "../enums/signature-action-enum";

export class CreateFirmaDto {

    @IsUUID()
    documentId: string;

    @IsBoolean()
    @IsOptional()
    isSigned: boolean;

    @IsEnum(TIPO_DE_DOCUMENTO)
    documentType: TIPO_DE_DOCUMENTO

    @IsOptional()
    @IsUUID()
    activationId?: string;

    @IsEnum(SIGNATURE_ACTION_ENUM)
    signatureAction: SIGNATURE_ACTION_ENUM;
}
