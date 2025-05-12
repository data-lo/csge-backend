import { ESTATUS_DE_CONTRATO } from 'src/contratos/interfaces/estatus-de-contrato';
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
import { EXTENSION_TYPE_ENUM } from '../enums/extension-type-enum';
import { TIPO_DE_CONTRATO } from 'src/contratos/interfaces/tipo-de-contrato';


@Entity({ name: 'contrato_modificatorio' })
export class ContratoModificatorio {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({
    name: 'estatus_de_contrato',
    type: 'enum',
    default: ESTATUS_DE_CONTRATO.PENDIENTE,
    enum: ESTATUS_DE_CONTRATO,
  })
  estatusDeContrato: ESTATUS_DE_CONTRATO;

  @Column({
    name: 'numero_de_contrato'
  })
  numeroDeContrato: string;

  @Column({
    name: 'cancellation_reason',
    nullable: true,
    default: null
  })
  cancellationReason: string;

  @Column({
    name: 'monto_maximo_contratado',
    type: 'decimal',
    default: 0.0,
    scale: 4,
    nullable: false,
  })
  montoMaximoContratado: number;

  @Column({
    name: 'monto_minimo_contratado',
    type: 'decimal',
    default: 0.0,
    scale: 4,
    nullable: false,
  })
  montoMinimoContratado: number;

  @Column({
    name: 'iva_monto_minimo_contratado',
    type: 'decimal',
    default: 0.0,
    scale: 4,
    nullable: false,
  })
  ivaMontoMinimoContratado: number;

  @Column({
    name: 'iva_monto_maximo_contratado',
    type: 'decimal',
    default: 0.0,
    scale: 4,
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
    scale: 4,
    nullable: false,
  })
  montoEjercido: number;

  @Column({
    name: 'monto_pagado',
    type: 'decimal',
    default: 0.0,
    scale: 4,
    nullable: false,
  })
  montoPagado: number;

  @Column({
    name: 'monto_disponible',
    type: 'decimal',
    default: 0.0,
    scale: 4,
    nullable: false,
  })
  montoDisponible: number;

  @Column({
    name: 'monto_activo',
    type: 'decimal',
    default: 0.0,
    scale: 4,
    nullable: false,
  })
  montoActivo: number;

  @Column({
    name: 'monto_reservado',
    type: 'decimal',
    scale: 4,
    default: 0.0,
    nullable: false,
  })
  committedAmount: number;

  @Column({
    name: 'extension_type',
    type: 'enum',
    default: EXTENSION_TYPE_ENUM.AMOUNTS,
    enum: EXTENSION_TYPE_ENUM,
    nullable: false,
  })
  extensionType: EXTENSION_TYPE_ENUM;


  @Column({
    name: 'contract_type',
    type: 'enum',
    default: TIPO_DE_CONTRATO.CERRADO,
    enum: TIPO_DE_CONTRATO,
    nullable: false,
  })
  contractType: TIPO_DE_CONTRATO;

  @Column({
    name: 'fecha_inicial',
    nullable: true 
  })
  fechaInicial: Date;

  @Column({
    name: 'fecha_final',
    nullable: true
  })
  fechaFinal: Date;

  @Column({
    name: 'link_al_contrato',
    nullable: true,
    default: null,
  })
  linkContrato: string;

  @Column({
    name: 'orders_services',
    type: 'uuid',
    nullable: true,
    default: null,
    array: true,
  })
  orders_services: string[];

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
}
