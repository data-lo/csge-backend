import { IsArray, IsOptional } from "class-validator";

export class CreateFirmaDto {

    @IsArray({
        each:true
    })
    ordenesDeServicioIds:string[];

    @IsArray({
        each:true
    })
    facturasIds:string[];

    @IsOptional()
    usuariosIds:string[];

    @IsOptional()
    documento:string;

}
