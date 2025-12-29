import { IsOptional, IsEnum } from 'class-validator';

export enum PayslipDownloadFormat {
    PDF = 'pdf',
}

export class PayslipDownloadDto {
    @IsOptional()
    @IsEnum(PayslipDownloadFormat)
    format?: PayslipDownloadFormat = PayslipDownloadFormat.PDF; // Download format (default: PDF)
}

