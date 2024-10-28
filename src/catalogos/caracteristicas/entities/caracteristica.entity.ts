import { Dimension } from "src/catalogos/dimensiones/entities/dimension.entity";
import { Formato } from "src/catalogos/formatos/entities/formato.entity";
import { Impresion } from "src/catalogos/impresiones/entities/impresion.entity";
import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { TipoUnidad } from "../interfaces/tipo-unidad.interface";

@Entity('caracteristicas')
export class Caracteristica {
    
    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;


    @Column({
        name:'unidad_id',
        type:'uuid',
        nullable:true
    })
    unidadId:string;

    @Column({
        name:'tipo_unidad',
        type:'enum',
        enum:TipoUnidad,
        nullable:true
    })
    tipoUnidad:TipoUnidad

    @ManyToOne(() => Dimension, (dimension)=>dimension.id,{
        nullable:true
    })
    @JoinColumn({name:'dimension_id'})
    dimensionId:Dimension;

    @ManyToOne(() => Impresion, (impresion)=> impresion.id,{
        nullable:true
    })
    @JoinColumn({name:'impresion_id'})
    impresionId:Impresion;

    @ManyToOne(() => Formato, (formato)=> formato.id,{
        nullable:true
    })
    @JoinColumn({name:'formato_id'})
    formatoId:Formato;

    @Column({
        name:'paginas_prensa',
        nullable:true,
        default:null
    })
    paginasPrensa:string;

    @Column({
        name:'seccion_prensa',
        nullable:true,
        default:null
    })
    seccionPrensa:string;

    @Column({
        name:'web_publicacion',
        nullable:true,
        default:null
    })
    webPublicacion:string;

    @Column({
        name:'nombre_programa',
        nullable:true,
        default:null
    })
    programa:string;
}
