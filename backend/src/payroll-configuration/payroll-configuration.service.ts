import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { payrollPoliciesDocument, payrollPolicies } from './models/payrollPolicies.schema';
import { allowanceDocument, allowance } from './models/allowance.schema';
import { CreatePayrollPolicyDto } from './dtos/createPayrollPolicy.dto';
import { UpdatePayrollPolicyDto } from './dtos/updatePayrollPolicy.dto';
import { ConfigStatus } from './enums/payroll-configuration-enums';
import { CreateAllowanceDto } from './dtos/createAllowance.dto';
import { UpdateAllowanceDto } from './dtos/updateAllowance.dto';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import {payGradeDocument, payGrade} from './models/payGrades.schema';
import { CreatePayGradeDto } from './dtos/createPayGrade.dto';
import { UpdatePayGradeDto } from './dtos/updatePayGrade.dto';
import { CreateInsureBracketDto } from './dtos/createInsureBracket.dto';
import { UpdateInsureBracketDto } from './dtos/updateInsureBracket.dto';
import {insuranceBracketsDocument, insuranceBrackets} from './models/insuranceBrackets.schema';
import { CreateSigningBonusDto } from './dtos/createSigningBonus.dto';
import { UpdateSigningBonusDto } from './dtos/updateSigningBonus.dto';
import { signingBonusDocument, signingBonus } from './models/signingBonus.schema';
import { LegalRules, LegalRulesDocument } from './models/legalRules.schema';
import { CompanyWideSettingsDocument, CompanyWideSettings } from './models/CompanyWideSettings.schema';
import { payTypeDocument, payType } from './models/payType.schema';
import { CreatePayTypeDto } from './dtos/createPayType.dto';
import { UpdatePayTypeDto } from './dtos/updatePayType.dto';
import { terminationAndResignationBenefitsDocument, terminationAndResignationBenefits } from './models/terminationAndResignationBenefits';
import { CreateCompanyWideSettingDto } from './dtos/createCompanyWideSetting.dto';
import { UpdateCompanyWideSettingDto } from './dtos/updateCompanyWideSetting.dto';
import { CreateTermResBenDto } from './dtos/createTermResBen.dto';
import { UpdateTermResBenDto } from './dtos/updateTermResBen.dto';
import { updateLegalDto } from './dtos/updateLegal.dto';
import { CreateTaxRuleDto } from './dtos/createTaxRules.dto';
import { taxRules, taxRulesDocument } from './models/taxRules.schema';
import { createLegalDto } from './dtos/createLegal.dto';
import { UpdateTaxRuleDto } from './dtos/updateTaxRules.dto';
//import { EmployeeSystemRoleDocument, EmployeeSystemRole } from '../employee-profile/models/employee-system-role.schema';




@Injectable()
export class PayrollConfigurationService {
 
     constructor(
    @InjectModel(payrollPolicies.name)
    private policyModel: Model<payrollPoliciesDocument>,
    @InjectModel(allowance.name)
    private allowanceModel: Model<allowanceDocument>,
    @InjectModel(payGrade.name)
    private payGradeModel: Model<payGradeDocument>,
    @InjectModel(insuranceBrackets.name)
    private insuranceBracketModel: Model<insuranceBracketsDocument>,
    @InjectModel(signingBonus.name)
    private signingBonusModel: Model<signingBonusDocument>,
    @InjectModel(LegalRules.name)
    private legalRulesModel: Model<LegalRulesDocument>,
    @InjectModel(CompanyWideSettings.name)
    private companyWideSettingsModel: Model<CompanyWideSettingsDocument>,
    @InjectModel(terminationAndResignationBenefits.name)
    private terminationAndResignationBenefitsModel: Model<terminationAndResignationBenefitsDocument>,
    @InjectModel(payType.name)
    private payTypeModel: Model<payTypeDocument>,
    @InjectModel(taxRules.name)
    private taxRulesModel: Model<taxRulesDocument>
  ) {}


    //payroll specialist:
    //create / edit payroll policy (draft) and view one/all

    async createPayrollPolicy(dto: CreatePayrollPolicyDto, userId: string){
        const newPolicy = new this.policyModel({
            ...dto,
            createdBy: userId,
            //status will be draft by default. still:
            status: ConfigStatus.DRAFT
        });
        return await newPolicy.save();
        
    }

    async updatePayrollPolicy(dto: UpdatePayrollPolicyDto, policyId: string, userId: string){
        
    
        const policy = await this.policyModel.findById(policyId);

        if(!policy){
            throw new Error('Payroll Policy not found');
        }
        if(policy.status !== ConfigStatus.DRAFT){
            throw new Error('Only draft policies can be Edited');
        }

        if(policy.createdBy?.toString() !== userId){
            throw new ForbiddenException('You are only allowed to update policies you have created');
        }

        Object.assign(policy, dto);
        return await policy.save();
        
    }

    //get all payroll policies
    async getAllPayrollPolicies(): Promise<payrollPolicies[]> {
        return await this.policyModel.find().exec();
    }

    async getOnePayrollPolicy(id: string): Promise<payrollPolicies> {
        const policy = await this.policyModel.findById(id);
        if(!policy){
            throw new Error('Payroll Policy Not Found');
        }
        return policy;
    }

    async deletePolicy(id: string){
        const policy = await this.policyModel.findById(id);
        if(!policy){
            throw new Error('Payroll Policy Not Found');
        }
        
        return await this.policyModel.findByIdAndDelete(id);
    }

    //paygrades definition
    //use the allowance from before in parameters

   async calculateGrossSalary(baseSalary: number,
  allowanceIds: (string | ObjectId)[]): Promise<number> {
  const allowances = await this.allowanceModel.find({
    _id: { $in: allowanceIds },
    status: ConfigStatus.APPROVED, // only approved allowances count
  });

  const totalAllowanceAmount = allowances.reduce(
    (sum, a) => sum + (a.amount || 0),
    0,
  );

  return baseSalary + totalAllowanceAmount;
}

    async createPayGrade(dto: CreatePayGradeDto, userId: string) {
  const grossSalary = await this.calculateGrossSalary(
    dto.baseSalary,
    dto.allowance,   
  );

  const grade = new this.payGradeModel({
    ...dto,
    grossSalary,
    createdBy: userId,
    status: ConfigStatus.DRAFT,
  });

  return grade.save();
}

async updatePayGrade(id: string, dto: UpdatePayGradeDto, userId: string) {
  const grade = await this.payGradeModel.findById(id);
  if (!grade) throw new Error('Pay grade not found');

  if (grade.status !== ConfigStatus.DRAFT)
    throw new Error('Only draft pay grades may be edited');

  Object.assign(grade, dto);

//   grade.grossSalary = await this.calculateGrossSalary(
//     grade.baseSalary,
//     grade.allowance,
//   );

 return grade.save();
}

  async deletePayGrade(id: string) {
    const grade = await this.payGradeModel.findById(id);
    if (!grade) throw new Error('Pay grade not found');
    return await this.payGradeModel.findByIdAndDelete(id);
  }

    async createInsuranceBracket(dto: CreateInsureBracketDto, userId: string) {
       const bracket = new this.insuranceBracketModel({
           ...dto,
           createdBy: userId,
           status: ConfigStatus.DRAFT
       })
    }

    async updateInsuranceBracket(id: string, dto: UpdateInsureBracketDto, userId: string) {
        const bracket = await this.insuranceBracketModel.findById(id);
        if (!bracket) throw new Error('Pay grade not found');
    
        if (bracket.status !== ConfigStatus.DRAFT)
          throw new Error('Only draft pay grades may be edited');
    
        Object.assign(bracket, dto); // Update the properties of grade with the properties from dto
        return bracket.save();
    }

    async createSigningBonus(dto: CreateSigningBonusDto, userId: string) {
        const bonus = new this.signingBonusModel({
            ...dto,
            createdBy: userId,
            status: ConfigStatus.DRAFT
        })
        return await bonus.save();

     }

     async updateSigningBonus(id: string, dto: UpdateSigningBonusDto, userId: string) {
        const bonus = await this.signingBonusModel.findById(id);
        if (!bonus) throw new Error('Signing bonus not found');
    
        if (bonus.status !== ConfigStatus.DRAFT)
          throw new Error('Only draft signing bonuses may be edited');
    
        Object.assign(bonus, dto); // Update the properties of grade with the properties from dto
        return await bonus.save();
    }

    //termination
    
    
    async createTerminationAndResignationBenefits(dto: CreateTermResBenDto, userId: string){
        const benefits = new this.terminationAndResignationBenefitsModel({
            ...dto,
            createdBy: userId,
            status: ConfigStatus.DRAFT
        });
        return await benefits.save();
    }

    async updateTerminationAndResignationBenefits(id: string, dto: UpdateTermResBenDto, userId: string){
        const benefits = await this.terminationAndResignationBenefitsModel.findById(id);
        if (!benefits) throw new Error('Benefit not found');
    
        if (benefits.status !== ConfigStatus.DRAFT)
          throw new Error('Only draft benefits may be edited');
    
        Object.assign(benefits, dto); // Update the properties of grade with the properties from dto
        return await benefits.save();
    }

    async deleteTermResBen(id: string) {
        const benefits = await this.terminationAndResignationBenefitsModel.findById(id);
        if (!benefits) throw new Error('Benefit not found');
        return await this.terminationAndResignationBenefitsModel.findByIdAndDelete(id);
    }

    async createPayType(dto: CreatePayTypeDto, userId: string){
        const payType = new this.payTypeModel({
            ...dto,
            createdBy: userId,
            status: ConfigStatus.DRAFT
        });
        return await payType.save();
    }

    async updatePayType(id: string, dto: UpdatePayTypeDto, userId: string){
        const payType = await this.payTypeModel.findById(id);
        if (!payType) throw new Error('Pay type not found');
    
        if (payType.status !== ConfigStatus.DRAFT)
          throw new Error('Only draft pay types may be edited');
    
        Object.assign(payType, dto); 
        return await payType.save();
    } 

    async deletePayType(id: string) {
        const payType = await this.payTypeModel.findById(id);
        if (!payType) throw new Error('Pay type not found');
        return await this.payTypeModel.findByIdAndDelete(id);
    }

    async editLegal( dto: updateLegalDto, userId: string){
        const legal = await this.legalRulesModel.findById(userId);
        if (!legal) throw new Error('Legal not found');
    
        Object.assign(legal, dto); 
        return await legal.save();
    }

    async createTaxRules (dto: CreateTaxRuleDto, userId: string){
        const taxRules = new this.taxRulesModel({
            ...dto,
            createdBy: userId,
            status: ConfigStatus.DRAFT
        });
        return await taxRules.save();
    }

    async createCompanyWideSeting(dto: CreateCompanyWideSettingDto, userId: string){
        const setting = new this.companyWideSettingsModel({
            ...dto,
            createdBy: userId,
            //wont default to status draFT
        })
        return await setting.save();
    }

    async updateCompanyWideSeting(id: string, dto: UpdateCompanyWideSettingDto){
        const setting = await this.companyWideSettingsModel.findById(id);
        if (!setting) throw new Error('Company wide setting not found');

        Object.assign(setting, dto); 
        return setting.save();
    }

    









    //submit for approval. (Note for next time, Use approval-status.enum)
     async submaitForApproval(policyId: string, userId: string){
        const policy = await this.policyModel.findById(policyId);
        
        if(!policy){
            throw new Error('Payroll Policy Not Found');
        }
        if(policy.status !== ConfigStatus.DRAFT){
            throw new Error('Only draft policies can be submitted for approval');
        }
        if(policy.createdBy?.toString() !== userId){
            throw new ForbiddenException('You are only allowed to submit policies you have created');
        }
        
        policy.status = ConfigStatus.PENDING;
       
        return await policy.save();
        
        // policy.approvalStatus = ApprovalStatus.PENDING; //nvm. this is for hiring. Might make enum atribute for pending?
        // return await policy.save();
    }

    async createAllowance(dto: CreateAllowanceDto, userId: string){
        const newAllowance = new this.allowanceModel({
            ...dto,
            createdBy: userId, //remember to remove created by from dtos
            status: ConfigStatus.DRAFT //policy status remains draft until sent to manager, then no editing allowed
        })
        return await newAllowance.save();
    }

    async updateAllowance(dto: UpdateAllowanceDto, userId: string , allowanceId: string){
        const allowance = await this.allowanceModel.findById(allowanceId);
        if(!allowance){
            throw new Error('Allowance not found');
        }
        if(allowance.createdBy?.toString() !== userId){
            throw new ForbiddenException('You are only allowed to update allowances you have created');
        }
        Object.assign(allowance, dto);
        return await allowance.save();
    }

    async findAllAllowances(): Promise<allowance[]> {
        return await this.allowanceModel.find().exec();
    }

    async findOneAllowance(id: string): Promise<allowance> {
        const allowance = await this.allowanceModel.findById(id);
        if(!allowance){
            throw new Error('Allowance Not Found');
        }
        return allowance;
    }

    //manager:
    //approve / reject policies

    async approvePolicy(policyId: string, user: any){
        const policy = await this.policyModel.findById(policyId);
        if(!policy){
            throw new Error('Payroll Policy Not Found');
        }
        if(user !== SystemRole.PAYROLL_MANAGER){
            throw new ForbiddenException('Only payroll managers are allowed to approve policies');
        }
        policy.status = ConfigStatus.APPROVED;
        policy.approvedBy = user._id.toString(); //correct later
        policy.approvedAt = new Date();
        return await policy.save();
        
    }

    async rejectPolicy(policyId: string, user: any){
        const policy = await this.policyModel.findById(policyId);
        if(!policy){
            throw new Error('Payroll Policy Not Found');
        }
        if(user !== SystemRole.PAYROLL_MANAGER){
            throw new ForbiddenException('Only payroll managers are allowed to reject policies');
        }
        policy.status = ConfigStatus.REJECTED;
        policy.approvedBy = user._id.toString(); //correct later
        policy.approvedAt = new Date();
        return await policy.save();
        
    }

    //what remains of the getAll/getOne functions:

    //pay grade
    async findAllPayGrades(): Promise<payGrade[]> {
  return await this.payGradeModel.find().exec();
    }

async findOnePayGrade(id: string): Promise<payGrade> {
  const grade = await this.payGradeModel.findById(id);
  if (!grade) throw new Error('Pay grade not found');
  return grade;
}

//ins bracket
async findAllInsuranceBrackets(): Promise<insuranceBrackets[]> {
  return await this.insuranceBracketModel.find().exec();
}

async findOneInsuranceBracket(id: string): Promise<insuranceBrackets> {
  const bracket = await this.insuranceBracketModel.findById(id);
  if (!bracket) throw new Error('Insurance bracket not found');
  return bracket;
}

//signing bonus:
async findAllSigningBonuses(): Promise<signingBonus[]> {
  return await this.signingBonusModel.find().exec();
}

async findOneSigningBonus(id: string): Promise<signingBonus> {
  const bonus = await this.signingBonusModel.findById(id);
  if (!bonus) throw new Error('Signing bonus not found');
  return bonus;
}

//term res
async findAllTerminationAndResignationBenefits(): Promise<terminationAndResignationBenefits[]> {
  return await this.terminationAndResignationBenefitsModel.find().exec();
}

async findOneTerminationAndResignationBenefit(id: string): Promise<terminationAndResignationBenefits> {
  const benefit = await this.terminationAndResignationBenefitsModel.findById(id);
  if (!benefit) throw new Error('Benefit not found');
  return benefit;
}

//paytypes
async findAllPayTypes(): Promise<payType[]> {
  return await this.payTypeModel.find().exec();
}

async findOnePayType(id: string): Promise<payType> {
  const ptype = await this.payTypeModel.findById(id);
  if (!ptype) throw new Error('Pay type not found');
  return ptype;
}

//legal
async findAllLegalRules(): Promise<LegalRules[]> {
  return await this.legalRulesModel.find().exec();
}

async findOneLegalRule(id: string): Promise<LegalRules> {
  const rule = await this.legalRulesModel.findById(id);
  if (!rule) throw new Error('Legal rule not found');
  return rule;
}

async updateLegalRule(id: string, dto: updateLegalDto, userId: string){
  const legal = await this.legalRulesModel.findById(userId);
  if (!legal) throw new Error('Legal rule not found');

  Object.assign(legal, dto); 
  return await legal.save();
}

async createLegalRule(dto: createLegalDto, userId: string){
  const legal = await this.legalRulesModel.create(dto);

  return await legal.save();
  
}

async deleteLegalRule(id: string) {
  const legal = await this.legalRulesModel.findByIdAndDelete(id);
  if (!legal) throw new Error('Legal rule not found');
  return await this.legalRulesModel.findByIdAndDelete(id);
}


//companywide setting:
async findAllCompanyWideSettings(): Promise<CompanyWideSettings[]> {
  return await this.companyWideSettingsModel.find().exec();
}

async findOneCompanyWideSetting(id: string): Promise<CompanyWideSettings> {
  const setting = await this.companyWideSettingsModel.findById(id);
  if (!setting) throw new Error('Company-wide setting not found');
  return setting;
}

//tax rules:
async findAllTaxRules(): Promise<taxRules[]> {
  return await this.taxRulesModel.find().exec();
}

async findOneTaxRule(id: string): Promise<taxRules> {
  const rule = await this.taxRulesModel.findById(id);
  if (!rule) throw new Error('Tax rule not found');
  return rule;
}

async updateTaxRule(id: string, dto: UpdateTaxRuleDto, userId: string){
  const tax = await this.taxRulesModel.findById(userId);
  if (!tax) throw new Error('Tax rule not found');

  Object.assign(tax, dto); 
  return await tax.save();
}

async deleteTaxRule(id: string) {
  const tax = await this.taxRulesModel.findByIdAndDelete(id);
  if (!tax) throw new Error('Tax rule not found');
  return await this.taxRulesModel.findByIdAndDelete(id);
}
  














    

    
    


        


            
       




 	




    

}
