import { EstatusDeContrato } from 'src/contratos/interfaces/estatus-de-contrato';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContratoMaestro } from 'src/contratos/contratos/entities/contrato.maestro.entity';
import { localeTimeFormatter } from 'src/helpers/localeTimeZoneFormater.function';
@Entity()
export class ContratoModificatorio {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({
    name: 'estatus_de_contrato',
    type: 'enum',
    default: EstatusDeContrato.PENDIENTE,
    enum: EstatusDeContrato,
  })
  estatusDeContrato: EstatusDeContrato;

  @Column({
    name:'numero_de_contrato'
  })
  numeroDeContrato:string;

  @Column({
    name: 'monto_maximo_contratado',
    type: 'decimal',
    default: 0.0,
    scale: 2,
    nullable: false,
  })
  montoMaximoContratado: number;

  @Column({
    name: 'monto_minimo_contratado',
    type: 'decimal',
    default: 0.0,
    scale: 2,
    nullable: false,
  })
  montoMinimoContratado: number;

  @Column({
    name: 'iva_monto_minimo_contratado',
    type: 'decimal',
    default: 0.0,
    scale: 2,
    nullable: false,
  })
  ivaMontoMinimoContratado: number;

  @Column({
    name: 'iva_monto_maximo_contratado',
    type: 'decimal',
    default: 0.0,
    scale: 2,
    nullable: false,
  })
  ivaMontoMaximoContratado: number;

  @Column({
    name: 'iva_frontera',
    type: 'boolean',
    default: false,
  })
  ivaFrontera: boolean;

  @Column({
    name: 'monto_ejercido',
    type: 'decimal',
    default: 0.0,
    scale: 2,
    nullable: false,
  })
  montoEjercido: number;

  @Column({
    name: 'monto_pagado',
    type: 'decimal',
    default: 0.0,
    scale: 2,
    nullable: false,
  })
  montoPagado: number;

  @Column({
    name: 'monto_disponible',
    type: 'decimal',
    default: 0.0,
    scale: 2,
    nullable: false,
  })
  montoDisponible: number;

  @Column({
    name: 'fecha_inicial',
    type: 'date',
    nullable: false,
  })
  fechaInicial: Date;

  @Column({
    name: 'fecha_final',
    type: 'date',
    nullable: false,
  })
  fechaFinal: Date;

  @Column({
    name: 'link_al_contrato',
    nullable: true,
    default: null,
  })
  linkContrato: string;

  @Column({
    name: 'ordenes_de_servicio_id',
    type: 'uuid',
    nullable: true,
    default: null,
    array: true,
  })
  ordenesDeServicioId: string[];

  @ManyToOne(() => ContratoMaestro, (contratoMaestro) => contratoMaestro.contratosModificatorios)
  @JoinColumn({ name: 'contrato_maestro_id' })
  contratoMaestro: ContratoMaestro;

  @CreateDateColumn({
    name: 'creado_en',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
  })
  actualizadoEn: Date;

  @BeforeInsert()
  localeTimeZoneInsert() {
    const value = new Date();
    this.creadoEn = localeTimeFormatter(value);
    this.actualizadoEn = localeTimeFormatter(value);
    this.fechaInicial = localeTimeFormatter(this.fechaInicial);
    this.fechaFinal = localeTimeFormatter(this.fechaFinal);
  }
  
  @BeforeUpdate()
  localeTimeZoneUpdate() {
    const value = new Date();
    this.actualizadoEn = localeTimeFormatter(value);
    this.fechaInicial = localeTimeFormatter(this.fechaInicial);
    this.fechaFinal = localeTimeFormatter(this.fechaFinal);
  }
}
