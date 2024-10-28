import { Dimension } from "src/catalogos/dimensiones/entities/dimension.entity";
import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

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
}