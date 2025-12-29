import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  employeeProfileId: string;
  nationalId: string;
  roles: string[];
  permissions: string[];
  employeeProfile: any;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

