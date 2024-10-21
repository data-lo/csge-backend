import { Column, Entity, Generated, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { TipoDeDocumento } from "../interfaces/tipo-de-documento";
import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";
import { Usuario } from "src/administracion/usuarios/entities/usuario.entity";

@Entity('responsables_de_firma')
export class ResponsableFirma {
    @PrimaryColumn("uuid")
    @Generated("uuid")
    id:string;

    @Column({
        type:"enum",
        enum:TipoDeDocumento,
    })
    tipoDeDocumento:TipoDeDocumento;

    @Column({
        type:"enum",
        enum:TipoDeServicio,
        array:true,
        nullable:true,
        unique:true
    })
    tipoDeServicio:TipoDeServicio[];

    @ManyToMany(()=> Usuario, usuario => usuario.firmasResponsables,{
        cascade:true,
    })
    @JoinTable({
        name:'usuario_responsable',
        joinColumn:{
            name:'responsableId',
            referencedColumnName:'id',
        },
        inverseJoinColumn:{
            name:'usuarioId',
            referencedColumnName:'id'
        },
    })
    responsables:Usuario[];
   
}