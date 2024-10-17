import { Column, Entity, Generated, PrimaryColumn } from "typeorm";
import { ValidPermises } from "../interfaces/usuarios.permisos";
import { ValidRoles } from "../interfaces/usuarios.roles";

@Entity('usuarios')
export class Usuario {
    @PrimaryColumn("uuid")
    @Generated("uuid")
    id:string;

    @Column({
        type:"bool",
        default:true
    })
    estatus:boolean;

    @Column({
        length:100
    })
    nombres:string;

    @Column({
        length:50
    })
    primerApellido:string;

    @Column({
        length:50,
        nullable:true
    })
    segundoApellido:string;

    @Column()
    puestoId:string;

    @Column()
    departamentoId:string;

    @Column({
        length:50,
        unique:true
    })
    correo:string;

    @Column({
        length:50
    })
    password:string;

    @Column({
        unique:true
    })
    numeroDeEmpleado:string;

    @Column({
        type:"enum",
        enum:ValidRoles,
        default:ValidRoles.AGENTE
    })
    rol:ValidRoles;

    @Column({
        type:"enum",
        enum:ValidPermises,
        array:true
    })
    permisos:ValidPermises[];


}
