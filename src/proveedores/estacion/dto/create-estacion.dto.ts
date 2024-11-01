import { IsArray, IsBoolean, IsString, IsUUID } from "class-validator";

export class CreateEstacionDto {
    @IsString()
    nombre:string;

    @IsBoolean()
    estatus:boolean;

    @IsArray()
    municipiosIds:string[]
}
