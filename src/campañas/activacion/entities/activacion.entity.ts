import { Campaña } from "src/campañas/campañas/entities/campaña.entity";
import { Partida } from "src/campañas/partida/entities/partida.entity";
import { Column, Entity, Generated, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";

@Entity('activaciones')
export class Activacion {
    
    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @Column({
        name:'fecha_de_creacion',
        type:'date',
        nullable:false,
    })
    fechaDeCreacion:Date;

    @Column({
        name:'fecha_de_inicio',
        type:'date',
        nullable:false,
    })
    fechaDeInicio:Date;

    @Column({
        name:'fecha_de_aprobacion',
        type:'date',
        nullable:true,
        default:null
    })
    fechaDeAprobacion:Date;

    @Column({
        name:'fecha_de_cierre',
        type:'date',
        nullable:false,
    })
    fechaDeCierre:Date;

    @Column({
        name:'estatus',
        type:'boolean',
        default:true,
        nullable:false
    })
    estatus:boolean;

    @OneToOne(() => Partida,{
        eager:true
    })
    @JoinColumn()
    partida:Partida;

    @ManyToOne(()=>Campaña, (campaña) => campaña.activaciones)
    campaña:Campaña

}
