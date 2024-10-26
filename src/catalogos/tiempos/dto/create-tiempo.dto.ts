import { Transform } from "class-transformer";
import { IsString } from "class-validator";

export class CreateTiempoDto {
    
    @IsString()
    unidad:string

    
    @IsString()
    simbolo:string
}
