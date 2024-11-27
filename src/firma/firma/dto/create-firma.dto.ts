import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { EstatusDeFirma } from "../interfaces/estatus-de-firma.enum";
import { TipoDeDocumento } from "src/administracion/usuarios/interfaces/usuarios.tipo-de-documento";

export class CreateFirmaDto {

    @IsUUID()
    ordenOFacturaId:string;

    @IsBoolean()
    @IsOptional()
    estaFirmado:boolean;

    @IsEnum(EstatusDeFirma)
    estatusDeFirma:EstatusDeFirma

    @IsEnum(TipoDeDocumento)
    tipoDeDocumento:TipoDeDocumento

    documentoEnPdf:PDFKit.PDFDocument;
}
