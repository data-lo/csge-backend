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

  @Column({ name: 'objeto_del_contrato' })
  objetoContrato: string;

  // 🧮 MONTOS CONTRATADOS
  @Column({
    name: 'monto_minimo_contratado',
    type: 'decimal',
    scale: 4,
    default: 0.0,
    nullable: false,
  })
  montoMinimoContratado: number;

  @Column({
    name: 'iva_monto_minimo_contratado',
    type: 'decimal',
    scale: 4,
    default: 0.0,
    nullable: false,
  })
  ivaMontoMinimoContratado: number;

  @Column({
    name: 'monto_maximo_contratado',
    type: 'decimal',
    scale: 4,
    default: null,
    nullable: false,
  })
  montoMaximoContratado: number;

  @Column({
    name: 'iva_monto_maximo_contratado',
    type: 'decimal',
    scale: 2,
    default: null,
    nullable: false,
  })
  ivaMontoMaximoContratado: number;

  // 💰 MONTOS OPERATIVOS

  @Column({
    name: 'monto_reservado',
    type: 'decimal',
    scale: 4,
    default: 0.0,
    nullable: false,
  })
  committedAmount: number;

  @Column({
    name: 'monto_disponible',
    type: 'decimal',
    scale: 4,
    default: 0.0,
    nullable: false,
  })
  montoDisponible: number;

  @Column({
    name: 'monto_pagado',
    type: 'decimal',
    scale: 4,
    default: 0.0,
    nullable: false,
  })
  montoPagado: number;

  @Column({
    name: 'monto_ejercido',
    type: 'decimal',
    scale: 4,
    default: 0.0,
    nullable: false,
  })
  montoEjercido: number;

  @Column({
    name: 'monto_activo',
    type: 'decimal',
    scale: 4,
    default: 0.0,
    nullable: false,
  })
  montoActivo: number;
  // 📆 FECHAS
  @Column({
    name: 'fecha_inicial',
    nullable: true
  })
  fechaInicial: Date;

  @Column({
    name: 'fecha_final',
    nullable: false
  })
  fechaFinal: Date;

  // ⚠️ OTROS
  @Column({
    name: 'cancellation_reason',
    nullable: true,
    default: false
  })
  cancellationReason: string;

  @Column({ name: 'link_al_contrato', nullable: true, default: null })
  linkContrato: string;

  @Column({
    name: 'iva_frontera',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  ivaFrontera: boolean;

  // RELACIONES
  @OneToMany(() => Contrato, (contrato) => contrato.contratoMaestro)
  contratos: Contrato[];

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.contratosMaestros, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  proveedor: Proveedor;

  @OneToMany(
    () => ContratoModificatorio,
    (contratoModificatorio) => contratoModificatorio.contratoMaestro,
  )
  contratosModificatorios: ContratoModificatorio[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
