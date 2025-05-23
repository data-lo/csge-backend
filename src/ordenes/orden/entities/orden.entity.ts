import { Campaña } from 'src/campañas/campañas/entities/campaña.entity';
import { Partida } from 'src/campañas/partida/entities/partida.entity';
import { ServicioContratado } from 'src/ordenes/servicio_contratado/entities/servicio_contratado.entity';
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
import { ESTATUS_ORDEN_DE_SERVICIO } from '../interfaces/estatus-orden-de-servicio';
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { ContratoMaestro } from 'src/contratos/contratos/entities/contrato.maestro.entity';
import { AvailableContractType } from 'src/contratos/contratos/types/available-contract-type';
import { ContractBreakdownList } from '../interfaces/contract-breakdown-list';

@Entity('ordenes_de_servicio')
export class Orden {

  @Generated('uuid')
  @PrimaryColumn('uuid')
  id: string;

  @Generated('increment')
  @Column()
  indice: number;

  @Column({
    type: 'enum',
    name: 'estatus_de_orden',
    enum: ESTATUS_ORDEN_DE_SERVICIO,
    nullable: false,
    default: ESTATUS_ORDEN_DE_SERVICIO.PENDIENTE,
  })
  estatus: ESTATUS_ORDEN_DE_SERVICIO;

  @Column({
    name: 'used_amendment_contracts',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  usedAmendmentContracts: boolean;

  @Column({
    name: 'contract_breakdown_list',
    type: 'jsonb',
    nullable: false,
    default: () => "'[]'::jsonb",
  })
  contractBreakdownList: ContractBreakdownList[];
  
  @Column({
    name: 'folio',
    nullable: false,
    unique: true,
  })
  folio: string;

  @Column({
    type: 'enum',
    enum: TIPO_DE_SERVICIO,
    nullable: false,
    default: TIPO_DE_SERVICIO.SERVICIOS_GENERALES,
  })
  tipoDeServicio: TIPO_DE_SERVICIO;

  @Column({
    name: 'fecha_de_emision',
    nullable: false,
  })
  fechaDeEmision: Date;

  @Column({
    name: 'fecha_de_aprobacion',
    default: null,
  })
  fechaDeAprobacion: Date;

  @Column({
    name: 'subtotal_orden_de_servicio',
    nullable: false,
    default: "0"
  })
  subtotal: string;

  @Column({
    name: 'number_of_activation',
    type: 'int',
    nullable: false,
    default: 1
  })
  numberOfActivation: number;

  @Column({
    name: 'iva_orden_de_servicio',
    nullable: false,
    default: "0"
  })
  iva: string;

  @Column({
    name: 'total',
    nullable: false,
    default: "0"
  })
  total: string;

  @Column({
    name: 'iva_incluido',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  ivaIncluido: boolean;

  @Column({
    name: 'orden_anterior_cancelada',
    type: 'uuid',
    nullable: true,
    default: null,
  })
  ordenAnteriorCancelada: string;

  @Column({
    name: 'motivo_de_cancelacion',
    nullable: true,
    default: null,
  })
  motivoDeCancelacion: string;

  @Column({
    name: 'cotizada_en_campania',
    nullable: false,
    default: false,
  })
  esCampania: boolean

  @CreateDateColumn({
    name: 'creado_en',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
  })
  actualizadoEn: Date;

  @ManyToOne(() => ContratoMaestro, (contratoMaestro) => contratoMaestro.id)
  contratoMaestro: ContratoMaestro;

  @ManyToOne(() => Campaña, (campaña) => campaña.id)
  campaña: Campaña;

  @ManyToOne(() => Partida, (partida) => partida.id)
  partida: Partida;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.id)
  proveedor: Proveedor;

  @OneToMany(
    () => ServicioContratado,
    (servicioContratado) => servicioContratado.ordenDeServicio,
    {
      onDelete: 'CASCADE',
      cascade: true
    }
  )
  serviciosContratados: ServicioContratado[];
}
