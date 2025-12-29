import { SetMetadata } from '@nestjs/common';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

export const Roles = (...roles: SystemRole[]) => SetMetadata('roles', roles);

