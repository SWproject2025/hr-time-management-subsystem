import { OfferResponseStatus } from '../enums/offer-response-status.enum';
import { OfferFinalStatus } from '../enums/offer-final-status.enum';

export class UpdateOfferStatusDto {
  responseStatus?: OfferResponseStatus;
  finalStatus?: OfferFinalStatus;
  changedBy: string;
}
