import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity('municipios')
export class Municipio {
    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @Column({
        name:'nombre_municipio',
        unique:true,
        nullable:false
    })
    nombre:string;

    @Column({
        name:'codigo_inegi',
        unique:true,
        nullable:false
    })
    codigoInegi:string;

    @Column({
        name:'es_frontera',
        type:'boolean',
        nullable:false,
        default:false
    })
    frontera:boolean;
}
