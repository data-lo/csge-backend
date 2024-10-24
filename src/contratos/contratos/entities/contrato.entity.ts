import { ContratoModificatorio } from "src/contratos/contratos_modificatorios/entities/contratos_modificatorio.entity";
import { EstatusDeContrato } from "src/contratos/interfaces/estatus-de-contrato";
import { TipoDeContrato } from "src/contratos/interfaces/tipo-de-contrato";
import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";
import { Column, Entity, Generated, OneToMany, PrimaryColumn } from "typeorm";

@Entity({name:'contratos'})
export class Contrato {
    
    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;
    
    @Column({
        name:'proveedor_id',
        type:'uuid',
        default:null,
        nullable:true
    })
    proveedorId:string;

    @Column({
        name:'numero_de_contrato',
    })
    numeroDeContrato:string;
    
    
    @Column({
        name:'estatus_de_contrato',
        type:'enum',
        enum:EstatusDeContrato,
        default:EstatusDeContrato.PENDIENTE
    })
    estatusDeContrato:EstatusDeContrato;

    @Column({
        name:'tipo_de_contrato',
        type:'enum',
        enum:TipoDeContrato
    })
    tipoDeContrato:TipoDeContrato;

    @Column({
        name:'tipo_de_servicio',
        type:'enum',
        enum:TipoDeServicio
    })
    tipoDeServicio:TipoDeServicio;

    @Column({
        name:'objeto_del_contrato'
    })
    objetoContrato:string;

    @Column({
        name:'monto_minimo_contratado',
        type:"decimal",
        default:0.00,
        scale:2,
        nullable:false
    })
    montoMinimoContratado:number;

    @Column({
        name:'iva_monto_minimo_contratado',
        type:'decimal',
        default:0.00,
        scale:2,
        nullable:false
    })
    ivaMontoMinimoContratado:number;
    
    @Column({
        name:'monto_maximo_contratado',
        type:'decimal',
        default:null,
        scale:2,
        nullable:true
    })
    montoMaximoContratado:number;

    @Column({
        name:'iva_monto_maximo_contratado',
        type:"decimal",
        default:null,
        scale:2,
        nullable:true
    })
    ivaMontoMaximoContratado:number;

    @Column({
        name:'monto_ejercido',
        type:'decimal',
        scale:2,
        default:0.00,
        nullable:false
    })
    monto_ejecido:number;

    @Column({
        name:'monto_pagado',
        type:'decimal',
        scale:2,
        default:0.00,
        nullable:false
    })
    monto_pagado:number;

    @Column({
        name:'monto_disponible',
        type:'decimal',
        scale:2,
        default:0.00,
        nullable:false
    })
    monto_disponible:number;

    @Column({
        name:'iva_frontera',
        type:'boolean',
        nullable:false,
        default:false
    })
    iva_frontera:boolean;

    @Column({
        name:'fecha_inicial',
        type:'date',
        nullable:false
    })
    fechaInicial:Date;

    @Column({
        name:'fecha_final',
        type:'date',
        nullable:false
    })
    fechaFinal:Date;

    @OneToMany(() => ContratoModificatorio, 
        (contratoModificatorio => contratoModificatorio.contrato)
    )
    contratosModificatorios: ContratoModificatorio[]

    @Column({
        name:'ordenes_de_servicio_id',
        type:'uuid',
        nullable:true,
        default:null,
        array:true
    })
    ordenDeServicio:string[];

    @Column({
        name:'motivo_de_cancelacion',
        nullable:true,
        default:null
    })
    motivoCancelacion:string;
    
    @Column({
        name:'link_al_contrato',
        nullable:true,
        default:null
    })
    linkContrato:string;
    
}