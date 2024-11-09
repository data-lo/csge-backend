import { Column, CreateDateColumn, Entity, Generated, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('tiempos')
export class Tiempo {

    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;

    @Column({
        name:'unidad',
        unique:true
    })
    unidad:string

    @Column({
        name:'simbolo',
        unique:true
    })
    simbolo:string;

    @CreateDateColumn({
        name:'creado_en'
    })
    creadoEn:Date;

    @UpdateDateColumn({
        name:'actualizado_en'
    })
    actualizadoEn:Date;
}
