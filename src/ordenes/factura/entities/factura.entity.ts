import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Generated,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { INVOICE_STATUS } from '../interfaces/estatus-factura';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { formatToLocalTime } from 'src/helpers/format-to-local-time';

@Entity('facturas')
export class Factura {
  
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    name: 'folio_factura',
    nullable: false,
  })
  folio: string;

  @Column({
    name: 'subtotal_factura',
    type: 'decimal',
    default: 0.0,
    scale: 4,
    nullable: false,
  })
  subtotal: number;

  @Column({
    name: 'iva_factura',
    type: 'decimal',
    default: 0.0,
    scale: 4,
    nullable: false,
  })
  iva: number;

  @Column({
    name: 'total_factura',
    type: 'decimal',
    default: 0.0,
    scale: 4,
    nullable: false,
  })
  total: number;

  @Column({
    name: 'validacion_testigo',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  validacionTestigo: boolean;

  @Column({
    name: 'fecha_de_aprobacion',
    type: 'date',
    nullable: true,
    default: null,
  })
  fechaAprobacion: Date;

  @Column({
    name: 'fecha_de_validacion',
    type: 'date',
    nullable: true,
    default: null,
  })
  fechaValidacion: Date;

  @Column({
    name: 'fecha_de_recepcion',
    type: 'date',
    nullable: true,
    default: null,
  })
  fechaDeRecepcion: Date;

  @Column({
    name: 'fecha_de_pago',
    type: 'date',
    nullable: true,
    default: null,
  })
  fechaDePago: Date;

  @Column({
    name: 'estatus_de_factura',
    type: 'enum',
    enum: INVOICE_STATUS,
    default: INVOICE_STATUS.RECIBIDA,
    nullable: false,
  })
  estatus: INVOICE_STATUS;

  @Column({
    name: 'motivo_cancelacion',
    nullable: true,
    default: null,
  })
  motivoCancelacion: string;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.id)
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Proveedor;

  @ManyToOne(() => Usuario, (usuario) => usuario.id)
  usuarioTestigo: Usuario;

  @ManyToMany(() => Orden, {
    eager: false,
  })
  @JoinTable()
  ordenesDeServicio: Orden[];

  @BeforeInsert()
  localeTimeZoneInsert() {
    const value = new Date()
    this.fechaDeRecepcion = formatToLocalTime(value);
    this.fechaValidacion = formatToLocalTime(value);
  }

  @BeforeUpdate()
  localeTimeZoneUpdate(){
    this.fechaDePago = formatToLocalTime(this.fechaDePago);
    this.fechaAprobacion = formatToLocalTime(this.fechaAprobacion);
  }
}
