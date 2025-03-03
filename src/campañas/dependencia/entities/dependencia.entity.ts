import { formatToLocalTime } from "src/helpers/format-to-local-time";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Generated, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('dependencias')
export class Dependencia {
    
    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @Column({
        name:'nombre_dependencia',
        nullable:false,
        unique:true
    })
    nombre:string;

    @CreateDateColumn({
        name:'creado_en'
    })
    creadoEn:Date;

    @UpdateDateColumn({
        name:'actualizado_en'
    })
    actualizadoEn:Date;

    @BeforeInsert()
    localeTimeZoneInsert() {
      const value = new Date();
      this.creadoEn = formatToLocalTime(value);
      this.actualizadoEn = formatToLocalTime(value);
    }

    @BeforeUpdate()
    localeTimeZoneUpdate() {
      const value = new Date();
      this.actualizadoEn = formatToLocalTime(value);
    }
}
