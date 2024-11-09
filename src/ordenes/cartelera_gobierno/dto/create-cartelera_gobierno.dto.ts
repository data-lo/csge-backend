import { IsString } from "class-validator";

export class CreateCarteleraGobiernoDto {
    
    @IsString()
    ubicacion:string;

    @IsString()
    idCartelera:string;
}
