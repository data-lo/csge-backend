import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

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
        default:0.00,
        scale:2,
        nullable:false
    })
    tarifaUnitaria:number;

    @Column({
        name:'iva',
        type:'decimal',
        default:0.00,
        scale:2,
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
}
