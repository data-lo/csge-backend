import { Column, CreateDateColumn, Entity, Generated, PrimaryColumn, UpdateDateColumn } from "typeorm";

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

    @CreateDateColumn({
        name:'creado_en'
    })
    creadoEn:Date;

    @UpdateDateColumn({
        name:'actualizado_en'
    })
    actualizadoEn:Date;
}
