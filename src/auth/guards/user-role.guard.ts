import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { META_ROLES } from '../decorators/role-protected.decorator';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const VALID_ROLES: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );
    if (!VALID_ROLES) return true;
    if (VALID_ROLES.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const usuario = req.user as Usuario;

    if (!usuario) {
      throw new BadRequestException('User not found');
    }

    if (VALID_ROLES.includes(usuario.rol)) {
      return true;
    }

    throw new ForbiddenException(
      `El usuario ${usuario.nombres} necesita un rol valido para el acceso al servicio`,
    );
  }
}
