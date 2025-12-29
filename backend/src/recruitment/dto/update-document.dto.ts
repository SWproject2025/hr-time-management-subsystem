import { DocumentType } from '../enums/document-type.enum';

export class UpdateDocumentDto {
  type?: DocumentType;
  filePath?: string;
}
