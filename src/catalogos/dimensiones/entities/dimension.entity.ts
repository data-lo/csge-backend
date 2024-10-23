import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

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

    @Column({
        name:'longitud_id',
        type:'uuid',
        nullable:true,
        default:null
    })
    longitudId:string;
}
