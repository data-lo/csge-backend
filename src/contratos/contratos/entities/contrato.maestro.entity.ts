import { ContratoModificatorio } from 'src/contratos/contratos_modificatorios/entities/contratos_modificatorio.entity';
import { EstatusDeContrato } from 'src/contratos/interfaces/estatus-de-contrato';
import { TipoDeContrato } from 'src/contratos/interfaces/tipo-de-contrato';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import {
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
    enum: EstatusDeContrato,
    default: EstatusDeContrato.PENDIENTE,
  })
  estatusDeContrato: EstatusDeContrato;

  @Column({
    name: 'tipo_de_contrato',
    type: 'enum',
    enum: TipoDeContrato,
  })
  tipoDeContrato: TipoDeContrato;

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
    nullable: true,
  })
  montoMaximoContratado: number;

  @Column({
    name: 'iva_monto_maximo_contratado',
    type: 'decimal',
    default: null,
    scale: 2,
    nullable: true,
  })
  ivaMontoMaximoContratado: number;

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

  @OneToMany(
    () => ContratoModificatorio,
    (contratoModificatorio) => contratoModificatorio.contrato,
  )
  contratosModificatorios: ContratoModificatorio[];

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

  @Column({
    name: 'monto_disponible',
    type: 'decimal',
    scale: 2,
    default: 0.0,
    nullable: false,
  })
  montoDisponible: number;

  @Column({
    name: 'monto_pagado',
    type: 'decimal',
    scale: 2,
    default: 0.0,
    nullable: false,
  })
  montoPagado: number;

  @Column({
    name: 'monto_ejercido',
    type: 'decimal',
    scale: 2,
    default: 0.0,
    nullable: false,
  })
  montoEjercido: number;


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

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.contratos)
  proveedor: Proveedor;

  @CreateDateColumn({
    name: 'creado_en',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
  })
  actualizadoEn: Date;
}
