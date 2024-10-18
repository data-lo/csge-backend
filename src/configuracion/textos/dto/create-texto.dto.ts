import { IsEnum, IsString } from "class-validator";
import { CamposDeTexto } from "../interfaces/textos.campos";

export class CreateTextoDto {
    @IsString()
    texto:string;

    @IsEnum(CamposDeTexto)
    campo:CamposDeTexto;
}


