import {IsString} from "class-validator";

export class CreatePuestoDto {
    @IsString()
    nombre:string;
}
