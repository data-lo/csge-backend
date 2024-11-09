import { Column, CreateDateColumn, Entity, Generated, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { TipoFormato } from "../interfaces/tipo.formato";

@Entity('tipo-formato')
export class Formato {
    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;

    @Column({
        name:'nombre_formato',
        unique:true
    })
    nombre:string;

    @Column({
        name:'tipo_formato',
        type:'enum',
        enum:TipoFormato
    })
    tipo:TipoFormato;

    @CreateDateColumn({
        name:'creado_en'
    })
    creadoEn:Date;

    @UpdateDateColumn({
        name:'actualizado_en'
    })
    actualizadoEn:Date;
}
