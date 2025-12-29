import { SetMetadata } from "@nestjs/common";
import { SystemRole } from "../../employee-profile/enums/employee-profile.enums";

export const ROLE_KEY = 'roles';
export const Roles = (...roles: SystemRole[]) => SetMetadata('roles', roles);