import { IsString } from "class-validator";

export class CreateDependenciaDto {
    @IsString()
    nombre:string;
}
