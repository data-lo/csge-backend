import { IsBoolean, IsHexColor, IsOptional, IsString } from "class-validator";

export class CreateColorDto {
    @IsString()
    @IsHexColor()
    color:string

    @IsBoolean()
    @IsOptional()
    primario:boolean
}
