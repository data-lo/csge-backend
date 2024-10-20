import { IsString, IsUUID} from "class-validator";

export class EliminarResponsableDto {
    
    @IsUUID()
    @IsString()
    usuarioId:string;

    @IsUUID()
    @IsString()
    responsableFirmaId:string
}