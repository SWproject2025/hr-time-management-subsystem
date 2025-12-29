import { 
  IsNotEmpty, 
  IsObject, 
  IsOptional, 
  IsString, 
  registerDecorator, 
  ValidationOptions, 
  ValidationArguments 
} from 'class-validator';

// --- 1. Define the Custom Security Validator ---
export function IsSafeChangeRequest(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSafeChangeRequest',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value || typeof value !== 'object') return false;

          // BLACKLIST: Fields that can NEVER be changed via Self-Service
          const restrictedFields = [
            '_id', 
            'employeeNumber', 
            'salary', 
            'payGradeId', 
            'status', 
            'roles', 
            'permissions',
            'supervisorPositionId'
          ];
          
          const keys = Object.keys(value);
          // Return TRUE if NO restricted keys are found
          return !keys.some(key => restrictedFields.includes(key));
        },
        defaultMessage(args: ValidationArguments) {
          return 'Request contains restricted fields (e.g., salary, status, IDs) that cannot be modified via self-service.';
        }
      },
    });
  };
}

// --- 2. The Updated DTO ---
export class CreateChangeRequestDto {
  @IsNotEmpty()
  @IsObject()
  @IsSafeChangeRequest() // <--- Apply the security check here
  changes: Record<string, any>;

  @IsOptional()
  @IsString()
  reason?: string;
}