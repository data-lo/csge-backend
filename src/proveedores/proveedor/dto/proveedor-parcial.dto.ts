import { IsEnum, IsString, MaxLength } from "class-validator";
import { TipoProveedor } from '../interfaces/tipo-proveedor.interface';

export class ProveedorParcialDto {

    @IsString()
    @MaxLength(13)
    rfc:string;

    @IsString()
    @MaxLength(100)
    razonSocial:string;

    @IsEnum(TipoProveedor)
    tipoProveedor:TipoProveedor
}