import { Campaña } from 'src/campañas/campañas/entities/campaña.entity';
import { Partida } from 'src/campañas/partida/entities/partida.entity';
import { Contrato } from 'src/contratos/contratos/entities/contrato.entity';
import { ServicioContratado } from 'src/ordenes/servicio_contratado/entities/servicio_contratado.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { EstatusOrdenDeServicio } from '../interfaces/estatus-orden-de-servicio';
import { TipoDeServicio } from 'src/contratos/interfaces/tipo-de-servicio';

@Entity('ordenes_de_servicio')
export class Orden {
  @Generated('uuid')
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    name: 'estatus_de_orden',
    enum: EstatusOrdenDeServicio,
    nullable: false,
    default: EstatusOrdenDeServicio.PENDIENTE,
  })
  estatus: EstatusOrdenDeServicio;

  @Column({
    name: 'folio',
    nullable: false,
    unique: true,
  })
  folio: string;

  @Column({
    type: 'enum',
    enum: TipoDeServicio,
    nullable: false,
    default: TipoDeServicio.SERVICIOS_GENERALES,
  })
  tipoDeServicio: TipoDeServicio;

  @Column({
    name: 'fecha_de_emision',
    type: 'date',
    nullable: false,
  })
  fechaDeEmision: Date;

  @Column({
    name: 'fecha_de_aprobacion',
    type: 'date',
    nullable: true,
    default: null,
  })
  fechaDeAprobacion: Date;

  @Column({
    name: 'subtotal_orden_de_servicio',
    type: 'decimal',
    default: 0.0,
    scale: 2,
    nullable: false,
  })
  subtotal: number;

  @Column({
    name: 'iva_orden_de_servicio',
    type: 'decimal',
    default: 0.0,
    scale: 2,
    nullable: false,
  })
  iva: number;

  @Column({
    name: 'total',
    type: 'decimal',
    default: 0.0,
    scale: 2,
    nullable: false,
  })
  total: number;

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

  @CreateDateColumn({
    name: 'creado_en',
  })
  creadoEn: Date;

  @CreateDateColumn({
    name: 'actualizado_en',
  })
  acutalizadoEn: Date;

  @ManyToOne(() => Contrato, (contrato) => contrato.id)
  contrato: Contrato;

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
    },
  )
  serviciosContratados: ServicioContratado[];
}
