import { IsArray, IsEnum, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { EstatusCampaña } from "../interfaces/estatus-campaña.enum";
import { TipoCampaña } from "../interfaces/tipo-campaña.enum";
import { CreateActivacionDto } from "src/campañas/activacion/dto/create-activacion.dto";
import { Type } from "class-transformer";
import { CreatePartidaDto } from "src/campañas/partida/dto/create-partida.dto";

export class CreateCampañaDto {
    
    @IsString()
    nombre:string;

    @IsEnum(EstatusCampaña)
    @IsOptional()
    estatus:EstatusCampaña;

    @IsEnum(TipoCampaña)
    tipoDeCampaña:TipoCampaña;
    
    @IsString()
    @IsOptional()
    motivoCancelacion:string;

    @IsObject()
    @ValidateNested()
    @Type(() => CreateActivacionDto)
    activacion:CreateActivacionDto;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => CreatePartidaDto,)
    partida:CreatePartidaDto;

    @IsArray({})
    @IsString({each:true})
    dependenciasIds:string[]
}
