import { IsString, IsUUID } from "class-validator";

export class AgregarContratoModificatorioDto{

    @IsUUID()
    @IsString()
    contratoId:string;

    @IsUUID()
    @IsString()
    contratoModificatorioId:string;
}