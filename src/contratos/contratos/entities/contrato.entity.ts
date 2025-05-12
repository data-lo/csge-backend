import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { BeforeInsert, BeforeUpdate, ManyToOne } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContratoMaestro } from './contrato.maestro.entity';
import { formatToLocalTime } from 'src/helpers/format-to-local-time';

@Entity({ name: 'contratos' })
export class Contrato {

  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;
  
  @Column({
    name: 'tipo_de_servicio',
    type: 'enum',
    enum: TIPO_DE_SERVICIO,
  })
  tipoDeServicio: TIPO_DE_SERVICIO;

  @Column({
    name: 'monto_activo',
    type: 'decimal',
    scale: 4,
    default: 0.0,
    nullable: false,
  })
  montoActivo: number;

  @Column({
    name: 'monto_ejercido',
    type: 'decimal',
    scale: 4,
    default: 0.0,
    nullable: false,
  })
  montoEjercido: number;

  @Column({
    name: 'monto_pagado',
    type: 'decimal',
    scale: 4,
    default: 0.0,
    nullable: false,
  })
  montoPagado: number;

  @Column({
    name: 'numero_de_contrato',
    unique: false,
  })
  numeroDeContrato: string;

  @ManyToOne(() => ContratoMaestro, (contratoMaestro) => contratoMaestro.id)
  contratoMaestro:ContratoMaestro

  @CreateDateColumn({
    name: 'creado_en',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
  })
  actualizadoEn: Date;
}
