import { Servicio } from "src/proveedores/servicio/entities/servicio.entity";
import { Column, CreateDateColumn, Entity, Generated, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('renovaciones')
export class Renovacion {
    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;

    @Column({
        name:'descripcion_del_servicio',
    })
    descripcionDelServicio:string;

    @Column({
        name:'caracteristicas_del_servicio',
        type:'json',
        nullable:false,
        default:{}
    })
    caracteristicasDelServicio:Object;

    @Column({
        name:'tarifa_unitaria',
        type:'decimal',
        default:0.0000,
        scale:4,
        nullable:false
    })
    tarifaUnitaria:number;

    @Column({
        name:'iva',
        type:'decimal',
        default:0.0000,
        scale:4,
        nullable:false
    })
    iva:number;

    @Column({
        name:'iva_incluido',
        type:'boolean',
        nullable:false,
        default:false
    })
    ivaIncluido:boolean;

    @Column({
        name:'iva_frontera',
        type:'boolean',
        nullable:false,
        default:false
    })
    ivaFrontera:boolean;

    @Column({   
        name:'fecha_de_creacion',
        type:'date',
        nullable:false,
    })
    fechaDeCreacion:Date;

    @Column({
        name:'estatus',
        type:'boolean',
        nullable:false,
        default:true
    })
    estatus:boolean;

    @ManyToOne(()=> Servicio,(servicio) => servicio.renovaciones)
    servicio:Servicio;

    @CreateDateColumn({
        name:'creado_en'
    })
    creadoEn:Date;

    @UpdateDateColumn({
        name:'actualizado_en'
    })
    actualizadoEn:Date;
}
