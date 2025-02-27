import { Transform, Type } from "class-transformer";
import { IsDate, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { CreatePartidaDto } from "src/campañas/partida/dto/create-partida.dto";

export class CreateActivacionDto {

    @IsOptional()
    @IsDate()
    fechaDeInicio: Date;

    @IsOptional()
    @IsDate()
    fechaDeCierre: Date;

    @IsOptional()
    @IsDate()
    fechaDeAprobacion: Date;

    @IsString()
    @IsUUID()
    @IsOptional()
    partidaId: string;

    @IsOptional()
    @IsString()
    @IsUUID()
    campaniaId: string;
}
