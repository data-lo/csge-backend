import { Column, CreateDateColumn, Entity, Generated, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('departamentos')
export class Departamento {
    @PrimaryColumn("uuid")
    @Generated("uuid")
    id:string;

    @Column({
        length:50,
        unique:true
    })
    nombre:string;

    @CreateDateColumn({
        name:'creado_en'
    })
    creadoEn:Date;

    @UpdateDateColumn({
        name:'actualizado_en'
    })
    actualizadoEn:Date;
}
