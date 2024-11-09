import { Longitud } from "src/catalogos/longitudes/entities/longitud.entity";
import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('dimensiones')
export class Dimension {
    
    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;

    @Column({
        name:'alto',
        type:'decimal',
        default:0.00,
        scale:2,
        nullable:false
    })
    alto:number;

    @Column({
        name:'ancho',
        type:'decimal',
        default:0.00,
        scale:2,
        nullable:false
    })
    ancho:number;
    
    @ManyToOne(()=> Longitud, (longitud)=> longitud.id)
    @JoinColumn({name:'longitud_id'})
    longitudId:Longitud;

    @CreateDateColumn({
        name:'creado_en'
    })
    creadoEn:Date;

    @UpdateDateColumn({
        name:'actualizado_en'
    })
    actualizadoEn:Date;
}
