import { IsString, IsUUID } from "class-validator";

export class EliminarContratoModificatorioDto{

    @IsUUID()
    @IsString()
    contratoId:string;

    @IsUUID()
    @IsString()
    contratoModificatorioId:string;
}