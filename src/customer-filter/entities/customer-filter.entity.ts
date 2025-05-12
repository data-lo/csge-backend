import { IsEnum, IsArray, IsString, } from "class-validator";
import { MODULE_ENUM } from "../enums/module-enum";

export class CreateQueryDto {
    @IsEnum(MODULE_ENUM)
    entity: MODULE_ENUM;

    @IsArray()
    @IsString({ each: true })
    relations: string[];

}
