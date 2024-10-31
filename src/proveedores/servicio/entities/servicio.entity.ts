import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";
import { Renovacion } from "src/proveedores/renovacion/entities/renovacion.entity";
import { Column, Entity, Generated, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('servicios')
export class Servicio {

    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @Column({
        name:'nombre_de_servicio',
        nullable:false
    })
    nombreDeServicio:string;
    
    @Column({
        name:'tipo_de_servicio',
        type:'enum',
        nullable:false,
        enum:TipoDeServicio
    })
    tipoDeServicio:TipoDeServicio

    @Column({
        name:'estatus',
        type:'boolean',
        nullable:false,
        default:true
    })
    estatus:boolean;

    @OneToMany(() => Renovacion, (renovacion) => renovacion.servicio)
    renovaciones:Renovacion[]
}
