import { tzDate } from '@formkit/tempo';
import { Campaña } from 'src/campañas/campañas/entities/campaña.entity';
import { Partida } from 'src/campañas/partida/entities/partida.entity';
import { formatToLocalTime } from 'src/helpers/format-to-local-time';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('activaciones')
export class Activacion {

  @Generated('uuid')
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    name: 'fecha_de_creacion',
    nullable: false,
  })
  fechaDeCreacion: Date;

  @Column({
    name: 'fecha_de_inicio',
    nullable: false,
  })
  fechaDeInicio: Date;

  @Column({
    name: 'fecha_de_aprobacion',
    nullable: true,
    default: null,
  })
  fechaDeAprobacion: Date;

  @Column({
    name: 'fecha_de_cierre',
    nullable: false,
  })
  fechaDeCierre: Date;

  @Column({
    name: 'status',
    type: 'boolean',
    nullable: false,
  })
  status: boolean;

  @Column({
    name: 'number_of_activation',
    type: 'int',
    nullable: false,
    default: 0
  })
  numberOfActivation: number;

  @OneToOne(() => Partida, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'partidaId' })
  partida: Partida;

  @ManyToOne(() => Campaña, (campaña) => campaña.activaciones, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'campaniaId' })
  campaña: Campaña;

  @CreateDateColumn({
    name: 'creado_en',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
  })
  actualizadoEn: Date;
}
