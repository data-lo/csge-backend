import { ContratoModificatorio } from 'src/contratos/contratos_modificatorios/entities/contratos_modificatorio.entity';
import { ESTATUS_DE_CONTRATO } from 'src/contratos/interfaces/estatus-de-contrato';
import { TIPO_DE_CONTRATO } from 'src/contratos/interfaces/tipo-de-contrato';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contrato } from './contrato.entity';
import { formatToLocalTime } from 'src/helpers/format-to-local-time';

@Entity({ name: 'contrato_maestro' })
export class ContratoMaestro {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({
    name: 'numero_de_contrato',
    unique: true,
  })
  numeroDeContrato: string;

  @Column({
    name: 'estatus_de_contrato',
    type: 'enum',
    enum: ESTATUS_DE_CONTRATO,
    default: ESTATUS_DE_CONTRATO.PENDIENTE,
  })
  estatusDeContrato: ESTATUS_DE_CONTRATO;

  @Column({
    name: 'tipo_de_contrato',
    type: 'enum',
    enum: TIPO_DE_CONTRATO,
  })
  tipoDeContrato: TIPO_DE_CONTRATO;

  @Column({
    name: 'objeto_del_contrato',
  })
  objetoContrato: string;

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
    name: 'monto_maximo_contratado',
    type: 'decimal',
    default: null,
    scale: 2,
    nullable: false,
  })
  montoMaximoContratado: number;

  @Column({
    name: 'monto_reservado',
    type: 'decimal',
    scale: 2,
    default: 0.0,
    nullable: false,
  })
  committedAmount: number;

  @Column({
    name: 'iva_monto_maximo_contratado',
    type: 'decimal',
    default: null,
    scale: 2,
    nullable: false,
  })
  ivaMontoMaximoContratado: number;

  @Column({
    name: 'fecha_inicial',
    type: 'date',
    nullable: true,
  })
  fechaInicial: Date;

  @Column({
    name: 'fecha_final',
    type: 'date',
    nullable: true,
  })
  fechaFinal: Date;

  @Column({
    name: 'motivo_de_cancelacion',
    nullable: true,
    default: null,
  })
  motivoCancelacion: string;

  @Column({
    name: 'link_al_contrato',
    nullable: true,
    default: null,
  })
  linkContrato: string;

  @Column({
    name: 'iva_frontera',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  ivaFrontera: boolean;

  //Se calcula con el monto maximo disponible
  @Column({
    name: 'monto_disponible',
    type: 'decimal',
    scale: 2,
    default: 0.0,
    nullable: false,
  })
  montoDisponible: number;

  //Se incrementa al momento de un pago de Secretaría de Hacienda
  @Column({
    name: 'monto_pagado',
    type: 'decimal',
    scale: 2,
    default: 0.0,
    nullable: false,
  })
  montoPagado: number;

  //Se incrementa al momento de una facturacion
  @Column({
    name: 'monto_ejercido',
    type: 'decimal',
    scale: 2,
    default: 0.0,
    nullable: false,
  })
  montoEjercido: number;

  //Se incrementa al momento de una contratacion
  @Column({
    name: 'monto_activo',
    type: 'decimal',
    scale: 2,
    default: 0.0,
    nullable: false,
  })
  montoActivo: number;

  @OneToMany(() => Contrato, (contrato) => contrato.contratoMaestro)
  contratos: Contrato[];

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.contratosMaestros, {
    onDelete: 'CASCADE',
    cascade: true
  })
  proveedor: Proveedor;

  @OneToMany(
    () => ContratoModificatorio,
    (contratoModificatorio) => contratoModificatorio.contratoMaestro,
  )
  contratosModificatorios: ContratoModificatorio[];

  @CreateDateColumn({
    name: 'creado_en',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
  })
  actualizadoEn: Date;
}
