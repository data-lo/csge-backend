import { formatToLocalTime } from 'src/helpers/format-to-local-time';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('partidas')
export class Partida {
  @Generated('uuid')
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    name: 'estatus',
    type: 'boolean',
    default: true,
    nullable: false,
  })
  estatus: boolean;

  @Column({
    name: 'monto_activo',
    type: 'decimal',
    default: 0,
    scale: 4,
    nullable: false,
  })
  montoActivo: number;

  @Column({
    name: 'monto_ejercido',
    type: 'decimal',
    default: 0,
    scale: 4,
    nullable: false,
  })
  montoEjercido: number;

  @Column({
    name: 'monto_pagado',
    type: 'decimal',
    default: 0,
    scale: 4,
    nullable: false,
  })
  montoPagado: number;

  @CreateDateColumn({
    name: 'creado_en',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
  })
  actualizadoEn: Date;

  // @BeforeInsert()
  // localeTimeZoneInsert() {
  //   const value = new Date();
  //   this.creadoEn = formatToLocalTime(value);
  //   this.actualizadoEn = formatToLocalTime(value);
  // }

  // @BeforeUpdate()
  // localeTimeZoneUpdate() {
  //   const value = new Date();
  //   this.actualizadoEn = formatToLocalTime(value);
  // }
}
