import { IsHexColor, IsString } from "class-validator";

export class CreateColorDto {
    @IsString()
    @IsHexColor()
    color:string
}
