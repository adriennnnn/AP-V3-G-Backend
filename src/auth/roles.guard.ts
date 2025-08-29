import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../users/entities/user.entity';
import { ROLES_KEY } from './roles.decorator';

function getRolePriority(role: UserRole): number {
  switch (role) {
    case UserRole.ADMIN:
      return 4;
    case UserRole.AUTHOR:
      return 3;
    case UserRole.SUBSCRIBER:
      return 2;
    case UserRole.USER:
      return 1;
    default:
      return 0;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const userPriority = getRolePriority(user.role);
    // Grant access if user's priority is >= any of the minimum required roles
    return requiredRoles.some((role) => userPriority >= getRolePriority(role));
  }
}
