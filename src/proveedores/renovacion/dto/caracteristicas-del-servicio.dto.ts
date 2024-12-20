import { IsOptional, IsString} from 'class-validator';

export class CaracteristicasDelServicioDto{
    
    //NOMBRE FOMRATO FULL COLOR, BLANCO Y NEGRO, A, AAA, AAA,
    @IsString()
    @IsOptional()
    nombreFormato: string;

    //IMPRESO AUDIOVIDUAL PIEZA SERVICIO TIPOFORMATO INTERFACE
    @IsString()
    @IsOptional()
    tipoFormato: string;

    //tipo unidad
    //LONGITUD /TIEMPO
    @IsString()
    @IsOptional()
    tipoUnidad: string;

    //VASOS PARA EVENTO
    @IsString()
    @IsOptional()
    pieza: string;

    //PAGINAS EN LA PRESNA
    @IsString()
    @IsOptional()
    paginasPrensa: string;


    //SECCIÓN EN LA PRESNA
    @IsString()
    @IsOptional()
    seccionPrensa: string;

    //SITIO WEB DE LA PUBLICACIÓN
    @IsString()
    @IsOptional()
    webPublicacion: string;

    //NOMBRE DE PROGRAMA
    @IsString()
    @IsOptional()
    programa: string;

    //12.4
    @IsString()
    @IsOptional()
    alto: string;

    //25.5
    @IsString()
    @IsOptional()
    ancho: string;

    //METRO, PULGADA, YARDA, SEGUNDO, MINTUO, HORA
    @IsString()
    @IsOptional()
    unidad: string;

    //MM, PX, YR, M, S, MIN, HR, 
    @IsString()
    @IsOptional()
    simbolo: string;

    //SUPLEMENTO, PUBLIREPORTAJE, PLANA
    @IsString()
    @IsOptional()
    medidaDeImpresion: string;
}