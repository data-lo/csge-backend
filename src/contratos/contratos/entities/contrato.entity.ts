import { TipoDeServicio } from 'src/contratos/interfaces/tipo-de-servicio';
import { ManyToOne } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContratoMaestro } from './contrato.maestro.entity';

@Entity({ name: 'contratos' })
export class Contrato {

  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;
  
  @Column({
    name: 'tipo_de_servicio',
    type: 'enum',
    enum: TipoDeServicio,
  })
  tipoDeServicio: TipoDeServicio;

  @Column({
    name: 'monto_activo',
    type: 'decimal',
    scale: 2,
    default: 0.0,
    nullable: false,
  })
  montoActivo: number;

  @Column({
    name: 'monto_ejercido',
    type: 'decimal',
    scale: 2,
    default: 0.0,
    nullable: false,
  })
  montoEjercido: number;

  @Column({
    name: 'numero_de_contrato',
    unique: true,
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
