import { IsString, IsUUID} from "class-validator";

export class AgregarResponsableDto {
    
    @IsUUID()
    @IsString()
    usuarioId:string;

    @IsUUID()
    @IsString()
    responsableFirmaId:string
}