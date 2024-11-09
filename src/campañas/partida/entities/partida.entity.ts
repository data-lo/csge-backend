import { Column, CreateDateColumn, Entity, Generated, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('partidas')
export class Partida {

    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @Column({
        name:'estatus',
        type:'boolean',
        default:true,
        nullable:false
    })
    estatus:boolean;

    @Column({
        name:'monto_activo',
        type:"decimal",
        default:0.00,
        scale:2,
        nullable:false
    })
    montoActivo:number;

    @Column({
        name:'monto_ejercido',
        type:"decimal",
        default:0.00,
        scale:2,
        nullable:false
    })
    montoEjercido:number;


    @Column({
        name:'monto_pagado',
        type:"decimal",
        default:0.00,
        scale:2,
        nullable:false
    })
    montoPagado:number;

    @CreateDateColumn({
        name:'creado_en'
    })
    creadoEn:Date;

    @UpdateDateColumn({
        name:'actualizado_en'
    })
    actualizadoEn:Date;

    //OneToMany
    //Orden de Servicio
}
