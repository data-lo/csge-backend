import { EstatusDeContrato } from "src/contratos/interfaces/estatus-de-contrato";
import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Contrato } from '../../contratos/entities/contrato.entity';
@Entity()
export class ContratoModificatorio {
    
    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;

    @Column({
        name:'estatus_de_contrato',
        type:'enum',
        default:EstatusDeContrato.PENDIENTE,
        enum:EstatusDeContrato
    })
    estatusDeContrato:EstatusDeContrato;

    @Column({
        name:'monto_contratado',
        type:'decimal',
        default:0.00,
        scale:2,
        nullable:false
    })
    montoContratado:number;

    @Column({
        name:'iva_monto_contratado',
        type:'decimal',
        default:0.00,
        scale:2,
        nullable:false
    })
    ivaMontoContratado:number;

    @Column({
        name:'iva_frontera',
        type:'boolean',
        default:false
    })
    ivaFrontera:boolean;

    @Column({
        name:'monto_ejercido',
        type:'decimal',
        default:0.00,
        scale:2,
        nullable:false
    })
    montoEjecido:number;

    @Column({
        name:'monto_pagado',
        type:'decimal',
        default:0.00,
        scale:2,
        nullable:false
    })
    montoPagado:number;

    @Column({
        name:'monto_disponible',
        type:'decimal',
        default:0.00,
        scale:2,
        nullable:false
    })
    montoDisponible:number;

    @Column({
        name:'fecha_inicial',
        type:'date',
        nullable:false
    })
    fechaInicial:string;

    
    @Column({
        name:'fecha_final',
        type:'date',
        nullable:false
    })
    fechaFinal:string;

    @Column({
        name:'link_al_contrato',
        nullable:true,
        default:null
    })
    linkContrato:string;

    @Column({
        name:'ordenes_de_servicio_id',
        type:'uuid',
        nullable:true,
        default:null,
        array:true
    })
    ordenesDeServicioId:string[];

    @ManyToOne(()=> Contrato, 
        (contrato)=> contrato.contratosModificatorios)
    @JoinColumn({name:'contrato_id'})
    contrato: Contrato
}
