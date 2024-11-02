import { IsEnum, IsOptional, IsString } from "class-validator";
import { EstatusCampaña } from "../interfaces/estatus-campaña.enum";
import { TipoCampaña } from "../interfaces/tipo-campaña.enum";

export class CreateCampañaDto {
    
    @IsString()
    nombre:string;

    @IsEnum(EstatusCampaña)
    estatus:EstatusCampaña;

    @IsEnum(TipoCampaña)
    tipoDeCampaña:TipoCampaña;
    
    @IsString()
    @IsOptional()
    motivoCancelacion:string;

}
