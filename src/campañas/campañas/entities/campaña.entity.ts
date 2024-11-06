import { Column, Entity, Generated, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { EstatusCampaña } from "../interfaces/estatus-campaña.enum";
import { Dependencia } from "src/campañas/dependencia/entities/dependencia.entity";
import { Activacion } from "src/campañas/activacion/entities/activacion.entity";

@Entity('campañas')
export class Campaña {
    
    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @Column({
        name:'nombre',
        nullable:false,
    })
    nombre:string; 

    @Column({
        name:'estatus',
        nullable:false,
        default:EstatusCampaña.CREADA,
        type:'enum',
        enum:EstatusCampaña
    })
    estatus:EstatusCampaña;

    @ManyToMany(()=>Dependencia)
    @JoinTable({name:'campañas_dependencias'})
    dependencias:Dependencia[];

    @OneToMany(()=>Activacion, (activacion)=> activacion.campaña)
    activaciones:Activacion[];
}
