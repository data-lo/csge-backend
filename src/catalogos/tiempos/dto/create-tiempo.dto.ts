import { IsString } from "class-validator";

export class CreateTiempoDto {
    
    @IsString()
    unidad:string
}
