import { PartialType } from '@nestjs/mapped-types';
import { CreateCalcDraftDto } from './create-calc-draft.dto';

export class UpdateCalcDraftDto extends PartialType(CreateCalcDraftDto) {}
