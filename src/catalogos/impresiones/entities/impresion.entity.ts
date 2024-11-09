import { Dimension } from "src/catalogos/dimensiones/entities/dimension.entity";
import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('impresiones')
export class Impresion {
    
    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;

    @Column({
        name:'medida_de_impresion',
        nullable:false,
        unique:true
    })
    medidaDeImpresion:string;

    @ManyToOne(()=> Dimension, (dimension)=> dimension.id,{
        nullable:true,
    })
    @JoinColumn({name:'dimension_id'})
    dimensionId:Dimension;

    @CreateDateColumn({
        name:'creado_en'
    })
    creadoEn:Date;

    @UpdateDateColumn({
        name:'actualizado_en'
    })
    actualizadoEn:Date;
}