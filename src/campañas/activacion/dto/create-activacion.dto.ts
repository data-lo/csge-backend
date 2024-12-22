import { Transform, Type } from "class-transformer";
import { IsDate, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { CreatePartidaDto } from "src/campañas/partida/dto/create-partida.dto";

export class CreateActivacionDto {
    

    @IsDate()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaDeInicio:string;

    @IsDate()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaDeCierre:string;

    @IsDate()
    @IsOptional()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaDeAprobacion:string;

    @IsString()
    @IsUUID()
    @IsOptional()
    partidaId:string;

    @IsOptional()
    @IsString()
    @IsUUID()
    campañaId:string;
}
