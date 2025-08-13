import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { INVOICE_STATUS } from '../interfaces/estatus-factura';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { PaymentRegister } from '../interfaces/payment-register';

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
    name: 'include_additional_taxes',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  includeAdditionalTaxes: boolean;

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
    name: 'is_witness_validated',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isWitnessValidated: boolean;

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
    name: 'payment_register',
    type: 'jsonb',
    nullable: true,
    default: () => "'{}'::jsonb",
  })
  paymentRegister: PaymentRegister[];

  @Column({
    name: 'status',
    type: 'enum',
    enum: INVOICE_STATUS,
    default: INVOICE_STATUS.RECIBIDA,
    nullable: false,
  })
  status: INVOICE_STATUS;

  @Column({
    name: 'cancellation_reason',
    nullable: true,
    default: null,
  })
  cancellationReason: string;

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
}
