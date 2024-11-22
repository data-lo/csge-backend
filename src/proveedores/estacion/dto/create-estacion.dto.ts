import { IsArray, IsBoolean, IsString, IsUUID } from "class-validator";

export class CreateEstacionDto {
    @IsString()
    nombreEstacion:string;

    @IsBoolean()
    estatus:boolean;

    @IsArray()
    municipiosIds:string[]

    @IsString()
    @IsUUID()
    proveedorId:string;
}
