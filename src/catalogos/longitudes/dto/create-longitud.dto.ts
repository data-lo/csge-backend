import { IsString } from "class-validator";

export class CreateLongitudDto {
    @IsString()
    unidad:string;

    @IsString()
    simbolo:string;
}
