import { UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ValidRoles } from "src/administracion/usuarios/interfaces/usuarios.roles";
import { RoleProtected } from "./role-protected.decorator";
import { UserRoleGuard } from "../guards/user-role.guard";

export function Auth(...roles:ValidRoles[]){  
    return applyDecorators(
        RoleProtected(...roles),
        UseGuards(AuthGuard(),UserRoleGuard),
    )
}