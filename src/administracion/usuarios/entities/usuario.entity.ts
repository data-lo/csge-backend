import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ValidPermises } from '../interfaces/usuarios.permisos';
import { ValidRoles } from '../interfaces/usuarios.roles';
import { Departamento } from 'src/administracion/departamentos/entities/departamento.entity';
import { Puesto } from 'src/administracion/puestos/entities/puesto.entity';
import { TipoDeDocumento } from '../interfaces/usuarios.tipo-de-documento';
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { Firma } from 'src/firma/firma/entities/firma.entity';
import { localeTimeFormatter } from 'src/helpers/localeTimeZoneFormater.function';

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({
    type: 'bool',
    default: true,
  })
  estatus: boolean;

  @Column({
    length: 100,
  })
  nombres: string;

  @Column({
    name: 'primer_apellido',
    length: 50,
  })
  primerApellido: string;

  @Column({
    name: 'segundo_apellido',
    length: 50,
    nullable: true,
  })
  segundoApellido: string;

  @Column({
    type: 'uuid',
    name: 'puesto_id',
  })
  puestoId: string;

  @ManyToOne(() => Puesto, { eager: true })
  @JoinColumn({ name: 'puesto_id' })
  puesto: Puesto;

  @Column({
    name: 'departamento_id',
    type: 'uuid',
  })
  departamentoId: string;

  @ManyToOne(() => Departamento, { eager: true })
  @JoinColumn({ name: 'departamento_id' })
  departamento: Departamento;

  @Column({
    length: 50,
    unique: true,
  })
  correo: string;

  @Column({
    length: 255,
  })
  password: string;

  @Column({
    name: 'numero_de_empleado',
    unique: true,
  })
  numeroDeEmpleado: string;

  @Column({
    name: 'rfc',
    unique: true,
    length: 13,
    nullable: true,
  })
  rfc: string;

  @Column({
    type: 'enum',
    enum: ValidRoles,
    default: ValidRoles.AGENTE,
  })
  rol: ValidRoles;

  @Column({
    type: 'enum',
    enum: ValidPermises,
    array: true,
    nullable: true
  })
  permisos: ValidPermises[];

  @Column({
    type: 'enum',
    enum: TipoDeDocumento,
    array: true,
    nullable: true,
    default: [],
  })
  documentosDeFirma: TipoDeDocumento[];

  @Column({
    type: 'enum',
    enum: TIPO_DE_SERVICIO,
    array: true,
    nullable: true,
    default: [],
  })
  tipoOrdenDeServicio: TIPO_DE_SERVICIO[];

  @CreateDateColumn({
    name: 'creado_en',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
  })
  actualizadoEn: Date;

  @ManyToMany(() => Firma, (firma) => firma.usuariosFirmadores)
  documentosParaFirmar: Firma[];

  @BeforeInsert()
  localeTimeZoneInsert() {
    const value = new Date();
    this.creadoEn = localeTimeFormatter(value);
    this.actualizadoEn = localeTimeFormatter(value);
  }

  @BeforeUpdate()
  localeTimeZoneUpdate() {
    const value = new Date();
    this.actualizadoEn = localeTimeFormatter(value);
  }
}
