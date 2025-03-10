import { IsArray, IsEnum, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { CAMPAIGN_STATUS } from "../interfaces/estatus-campaña.enum";
import { TipoCampaña } from "../interfaces/tipo-campaña.enum";
import { CreateActivacionDto } from "src/campañas/activacion/dto/create-activacion.dto";
import { Type } from "class-transformer";

export class CreateCampañaDto {

    @IsString()
    nombre: string;

    @IsEnum(CAMPAIGN_STATUS)
    @IsOptional()
    estatus: CAMPAIGN_STATUS;

    @IsEnum(TipoCampaña)
    tipoDeCampaña: TipoCampaña;

    @IsString()
    @IsOptional()
    motivoCancelacion: string;

    @IsObject()
    @ValidateNested()
    @Type(() => CreateActivacionDto)
    activacion: CreateActivacionDto;

    @IsArray({})
    @IsString({ each: true })
    dependenciasIds: string[]
}
