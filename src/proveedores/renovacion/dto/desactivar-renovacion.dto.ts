import { IsBoolean, IsString, IsUUID } from "class-validator";

export class DesactivarRenovacionDto {
    @IsUUID()
    @IsString()
    renovacionId:string;
}