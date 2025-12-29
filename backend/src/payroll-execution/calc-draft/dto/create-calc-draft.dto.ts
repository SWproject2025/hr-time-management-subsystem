import { IsString, IsNumber, IsNotEmpty, IsOptional, Length, IsDate, IsMongoId, IsNegative, Min, Max, IsDateString } from 'class-validator';

export class CreateCalcDraftDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 255) 
    darftId: string;
  
      @IsMongoId()
      @IsNotEmpty()
      payrollRunId: string;
    
      @IsDateString()
      @IsNotEmpty()
      payrollPeriodStart: Date;
    
      @IsDateString()
      @IsNotEmpty()
      payrollPeriodEnd: Date;
    
      @IsNumber()
      @IsNotEmpty()
      @Min(1)
      @Max(12)
      payrollMonth: number;
    
      @IsNumber()
      @IsNotEmpty()
      @Min(2000)
      @Max(2030)
      payrollYear: number;
    
      @IsNumber()
      @IsNotEmpty()
      totalEmployees: number;
    
      @IsNumber()
      @IsNotEmpty()
      totalGrossPay: number;
    
      @IsNumber()
      @IsNotEmpty()
      totalDeductions: number;
    
      @IsNumber()
      @IsNotEmpty()
      totalNetPay: number;
    
      @IsNumber()
      @IsNotEmpty()
      totalPenalties: number;
    
      @IsNumber()
      @IsNotEmpty()
      totalExceptions: number;
    
      @IsNegative()
      @IsNumber()
      @IsOptional()
      negativeNetPayCount?: number;
    
      @IsMongoId()
      @IsNotEmpty()
      generatedBy: string;
    
      @IsDateString()
      @IsNotEmpty()
      generatedAt: Date;
}
