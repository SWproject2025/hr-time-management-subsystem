// backend/src/performance/dto/update-appraisal-template.dto.ts

import { AppraisalTemplateType } from '../enums/performance.enums';
import {
  EvaluationCriterionDto,
  RatingScaleDefinitionDto,
} from './create-appraisal-template.dto';

export class UpdateAppraisalTemplateDto {
  name?: string;
  description?: string;
  templateType?: AppraisalTemplateType;

  // ✅ now includes step + labels
  ratingScale?: RatingScaleDefinitionDto;

  criteria?: EvaluationCriterionDto[];
  instructions?: string;
  applicableDepartmentIds?: string[];
  applicablePositionIds?: string[];
  isActive?: boolean;
}
