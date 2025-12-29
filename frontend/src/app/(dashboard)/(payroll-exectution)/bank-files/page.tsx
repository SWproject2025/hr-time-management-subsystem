"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Download, Eye, FileText, X, Calendar, DollarSign, Users, AlertCircle, Building, CreditCard, FileSpreadsheet, Printer } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface PayrollRun {
  _id: string;
  runId: string;
  payrollPeriod: string;
  entity: string;
  employees: number;
  exceptions: number;
  totalnetpay: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface Payslip {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  grossSalary: number;
  deductions: number;
  netPay: number;
  status: string;
  earnings: {
    baseSalary: number;
    allowances: number;
    bonuses: number;
    benefits: number;
    refunds: number;
  };
  deductionsBreakdown: {
    taxes: number;
    insurance: number;
    penalties: number;
  };
}

interface EmployeeDetail {
  _id: string;
  employeeId: any;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  netPay: number;
  bonus: number;
  benefit: number;
  bankStatus: string;
  exceptions: string | null;
}

const BankFilesPage = () => {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    runId: '',
    format: 'CSV',
    bankName: '',
    includeDetails: true,
    includeSummary: true,
  });

  useEffect(() => {
    fetchPayrollRuns();
  }, []);

  const fetchPayrollRuns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs`);
      if (!response.ok) throw new Error('Failed to fetch payroll runs');
      
      const data = await response.json();
      
      // Filter to only approved/locked runs
      const eligibleRuns = data.filter((run: PayrollRun) => 
        ['APPROVED', 'LOCKED', 'approved', 'locked'].includes(run.status)
      );
      
      setPayrollRuns(eligibleRuns);
    } catch (err: any) {
      console.error('Error fetching payroll runs:', err);
      setError(err.message || 'Failed to load payroll runs');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayslipsForRun = async (runId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/payroll-execution/payslips?runId=${runId}`);
      if (!response.ok) throw new Error('Failed to fetch payslips');
      
      const data = await response.json();
      setPayslips(data);
      return data;
    } catch (err: any) {
      console.error('Error fetching payslips:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRunDetails = async (runId: string) => {
    try {
      // Try to get detailed employee data from draft review endpoint
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${runId}/review/draft`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeDetails(data.employees || []);
        return data;
      }
    } catch (err) {
      console.error('Error fetching run details:', err);
    }
    return null;
  };

  const handleGenerateFile = async () => {
    if (!generateForm.runId || !generateForm.format || !generateForm.bankName) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch payslips and run details
      const payslipsData = await fetchPayslipsForRun(generateForm.runId);
      const runDetailsData = await fetchRunDetails(generateForm.runId);
      
      if (!payslipsData || payslipsData.length === 0) {
        alert('No payslips found for this payroll run. Please generate payslips first.');
        return;
      }

      const selectedRunDetails = payrollRuns.find(r => r._id === generateForm.runId);
      
      // Generate file based on format
      let fileContent = '';
      let fileName = '';
      let mimeType = 'text/plain';
      
      const timestamp = new Date().toISOString().split('T')[0];
      const runIdClean = selectedRunDetails?.runId || 'Unknown';
      
      switch (generateForm.format) {
        case 'CSV':
          fileContent = generateComprehensiveCSV(payslipsData, selectedRunDetails, runDetailsData);
          fileName = `Bank_Transfer_${runIdClean}_${generateForm.bankName}_${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        case 'TXT':
          fileContent = generateComprehensiveTXT(payslipsData, selectedRunDetails, runDetailsData);
          fileName = `Bank_Transfer_${runIdClean}_${generateForm.bankName}_${timestamp}.txt`;
          break;
        case 'XML':
          fileContent = generateComprehensiveXML(payslipsData, selectedRunDetails, runDetailsData);
          fileName = `Bank_Transfer_${runIdClean}_${generateForm.bankName}_${timestamp}.xml`;
          mimeType = 'application/xml';
          break;
        case 'JSON':
          fileContent = generateComprehensiveJSON(payslipsData, selectedRunDetails, runDetailsData);
          fileName = `Bank_Transfer_${runIdClean}_${generateForm.bankName}_${timestamp}.json`;
          mimeType = 'application/json';
          break;
        case 'PDF_DATA':
          fileContent = generatePDFReadyHTML(payslipsData, selectedRunDetails, runDetailsData);
          fileName = `Bank_Transfer_Report_${runIdClean}_${timestamp}.html`;
          mimeType = 'text/html';
          break;
      }

      // Download file
      const blob = new Blob([fileContent], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert(`Bank file generated successfully!\n\nFile: ${fileName}\nEmployees: ${payslipsData.length}\nTotal Net Pay: $${calculateTotal(payslipsData).toLocaleString()}`);
      
      setShowGenerateModal(false);
      setGenerateForm({ runId: '', format: 'CSV', bankName: '', includeDetails: true, includeSummary: true });
    } catch (err: any) {
      setError(err.message || 'Failed to generate bank file');
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Comprehensive CSV Generation
  const generateComprehensiveCSV = (payslips: Payslip[], runDetails: PayrollRun | undefined, detailedData: any) => {
    const lines: string[] = [];
    
    // Header Section
    lines.push('BANK TRANSFER FILE - COMPREHENSIVE REPORT');
    lines.push('');
    lines.push('PAYROLL RUN INFORMATION');
    lines.push(`Run ID,${runDetails?.runId || 'N/A'}`);
    lines.push(`Entity,${runDetails?.entity || 'N/A'}`);
    lines.push(`Payroll Period,${runDetails?.payrollPeriod ? new Date(runDetails.payrollPeriod).toLocaleDateString() : 'N/A'}`);
    lines.push(`Status,${runDetails?.status || 'N/A'}`);
    lines.push(`Payment Status,${runDetails?.paymentStatus || 'N/A'}`);
    lines.push(`Total Employees,${payslips.length}`);
    lines.push(`Total Net Pay,$${calculateTotal(payslips).toLocaleString()}`);
    lines.push(`Generated Date,${new Date().toLocaleString()}`);
    lines.push(`Bank,${generateForm.bankName}`);
    lines.push('');
    
    // Summary Section
    if (generateForm.includeSummary) {
      lines.push('SUMMARY BY DEPARTMENT');
      const deptSummary = payslips.reduce((acc: any, slip) => {
        const dept = slip.department || 'Unassigned';
        if (!acc[dept]) {
          acc[dept] = { count: 0, total: 0 };
        }
        acc[dept].count++;
        acc[dept].total += slip.netPay || 0;
        return acc;
      }, {});
      
      lines.push('Department,Employee Count,Total Net Pay');
      Object.entries(deptSummary).forEach(([dept, data]: [string, any]) => {
        lines.push(`${dept},${data.count},$${data.total.toLocaleString()}`);
      });
      lines.push('');
    }
    
    // Detail Section
    if (generateForm.includeDetails) {
      lines.push('EMPLOYEE PAYMENT DETAILS');
      lines.push('Employee Code,Employee Name,Department,Base Salary,Allowances,Bonuses,Benefits,Gross Salary,Tax,Insurance,Penalties,Total Deductions,Net Pay,Bank Name,Account Number,Status');
      
      payslips.forEach((slip, index) => {
        const bankAccount = `XXXX-XXXX-${String(index + 1).padStart(4, '0')}`;
        lines.push([
          slip.employeeCode || slip.employeeId,
          `"${slip.employeeName || 'Unknown'}"`,
          slip.department || 'N/A',
          slip.earnings?.baseSalary || 0,
          slip.earnings?.allowances || 0,
          slip.earnings?.bonuses || 0,
          slip.earnings?.benefits || 0,
          slip.grossSalary || 0,
          slip.deductionsBreakdown?.taxes || 0,
          slip.deductionsBreakdown?.insurance || 0,
          slip.deductionsBreakdown?.penalties || 0,
          slip.deductions || 0,
          slip.netPay || 0,
          generateForm.bankName,
          bankAccount,
          slip.status || 'pending'
        ].join(','));
      });
    }
    
    // Footer
    lines.push('');
    lines.push('END OF REPORT');
    lines.push(`Total Records,${payslips.length}`);
    lines.push(`Total Amount,$${calculateTotal(payslips).toFixed(2)}`);
    
    return lines.join('\n');
  };

  // Comprehensive TXT Generation
  const generateComprehensiveTXT = (payslips: Payslip[], runDetails: PayrollRun | undefined, detailedData: any) => {
    const divider = '═'.repeat(120);
    const subDivider = '─'.repeat(120);
    const lines: string[] = [];
    
    lines.push(divider);
    lines.push('                              BANK TRANSFER FILE - COMPREHENSIVE REPORT');
    lines.push(divider);
    lines.push('');
    
    // Run Information
    lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                                           PAYROLL RUN INFORMATION                                                   │');
    lines.push('├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤');
    lines.push(`│  Run ID:          ${(runDetails?.runId || 'N/A').padEnd(98)}│`);
    lines.push(`│  Entity:          ${(runDetails?.entity || 'N/A').padEnd(98)}│`);
    lines.push(`│  Period:          ${(runDetails?.payrollPeriod ? new Date(runDetails.payrollPeriod).toLocaleDateString() : 'N/A').padEnd(98)}│`);
    lines.push(`│  Status:          ${(runDetails?.status || 'N/A').padEnd(98)}│`);
    lines.push(`│  Bank:            ${generateForm.bankName.padEnd(98)}│`);
    lines.push(`│  Generated:       ${new Date().toLocaleString().padEnd(98)}│`);
    lines.push('└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');
    
    // Summary Statistics
    lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│                                              SUMMARY STATISTICS                                                     │');
    lines.push('├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤');
    
    const totalGross = payslips.reduce((sum, s) => sum + (s.grossSalary || 0), 0);
    const totalDeductions = payslips.reduce((sum, s) => sum + (s.deductions || 0), 0);
    const totalNet = calculateTotal(payslips);
    
    lines.push(`│  Total Employees:                 ${String(payslips.length).padStart(10)}                                                              │`);
    lines.push(`│  Total Gross Salary:           $${totalGross.toLocaleString().padStart(12)}                                                              │`);
    lines.push(`│  Total Deductions:             $${totalDeductions.toLocaleString().padStart(12)}                                                              │`);
    lines.push(`│  Total Net Pay:                $${totalNet.toLocaleString().padStart(12)}                                                              │`);
    lines.push('└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');
    
    // Department Summary
    if (generateForm.includeSummary) {
      lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐');
      lines.push('│                                            DEPARTMENT SUMMARY                                                       │');
      lines.push('├──────────────────────────────────────┬───────────────────┬──────────────────────────────────────────────────────────┤');
      lines.push('│  Department                          │  Employees        │  Total Net Pay                                           │');
      lines.push('├──────────────────────────────────────┼───────────────────┼──────────────────────────────────────────────────────────┤');
      
      const deptSummary = payslips.reduce((acc: any, slip) => {
        const dept = slip.department || 'Unassigned';
        if (!acc[dept]) acc[dept] = { count: 0, total: 0 };
        acc[dept].count++;
        acc[dept].total += slip.netPay || 0;
        return acc;
      }, {});
      
      Object.entries(deptSummary).forEach(([dept, data]: [string, any]) => {
        lines.push(`│  ${dept.padEnd(36)}│  ${String(data.count).padEnd(17)}│  $${data.total.toLocaleString().padEnd(55)}│`);
      });
      
      lines.push('└──────────────────────────────────────┴───────────────────┴──────────────────────────────────────────────────────────┘');
      lines.push('');
    }
    
    // Employee Details
    if (generateForm.includeDetails) {
      lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐');
      lines.push('│                                          EMPLOYEE PAYMENT DETAILS                                                   │');
      lines.push('├──────┬────────────────┬──────────────────────────────┬──────────────────┬───────────────┬───────────────┬───────────┤');
      lines.push('│  #   │  Employee ID   │  Employee Name               │  Department      │  Gross Salary │  Deductions   │  Net Pay  │');
      lines.push('├──────┼────────────────┼──────────────────────────────┼──────────────────┼───────────────┼───────────────┼───────────┤');
      
      payslips.forEach((slip, index) => {
        const num = String(index + 1).padStart(4);
        const empId = (slip.employeeCode || slip.employeeId || '').toString().substring(0, 14).padEnd(14);
        const empName = (slip.employeeName || 'Unknown').substring(0, 28).padEnd(28);
        const dept = (slip.department || 'N/A').substring(0, 16).padEnd(16);
        const gross = ('$' + (slip.grossSalary || 0).toLocaleString()).padStart(13);
        const ded = ('$' + (slip.deductions || 0).toLocaleString()).padStart(13);
        const net = ('$' + (slip.netPay || 0).toLocaleString()).padStart(9);
        
        lines.push(`│ ${num} │ ${empId} │ ${empName} │ ${dept} │ ${gross} │ ${ded} │ ${net} │`);
      });
      
      lines.push('└──────┴────────────────┴──────────────────────────────┴──────────────────┴───────────────┴───────────────┴───────────┘');
    }
    
    lines.push('');
    lines.push(divider);
    lines.push('                                              END OF REPORT');
    lines.push(divider);
    
    return lines.join('\n');
  };

  // Comprehensive XML Generation
  const generateComprehensiveXML = (payslips: Payslip[], runDetails: PayrollRun | undefined, detailedData: any) => {
    const escapeXml = (str: string) => str.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<BankTransferReport>\n';
    xml += '  <Header>\n';
    xml += `    <ReportTitle>Bank Transfer File - Comprehensive Report</ReportTitle>\n`;
    xml += `    <GeneratedDate>${new Date().toISOString()}</GeneratedDate>\n`;
    xml += `    <GeneratedBy>Payroll System</GeneratedBy>\n`;
    xml += '  </Header>\n';
    
    xml += '  <PayrollRunInfo>\n';
    xml += `    <RunID>${escapeXml(runDetails?.runId || 'N/A')}</RunID>\n`;
    xml += `    <Entity>${escapeXml(runDetails?.entity || 'N/A')}</Entity>\n`;
    xml += `    <PayrollPeriod>${runDetails?.payrollPeriod ? new Date(runDetails.payrollPeriod).toISOString() : 'N/A'}</PayrollPeriod>\n`;
    xml += `    <Status>${runDetails?.status || 'N/A'}</Status>\n`;
    xml += `    <PaymentStatus>${runDetails?.paymentStatus || 'N/A'}</PaymentStatus>\n`;
    xml += `    <BankName>${escapeXml(generateForm.bankName)}</BankName>\n`;
    xml += '  </PayrollRunInfo>\n';
    
    xml += '  <Summary>\n';
    xml += `    <TotalEmployees>${payslips.length}</TotalEmployees>\n`;
    xml += `    <TotalGrossSalary>${payslips.reduce((sum, s) => sum + (s.grossSalary || 0), 0).toFixed(2)}</TotalGrossSalary>\n`;
    xml += `    <TotalDeductions>${payslips.reduce((sum, s) => sum + (s.deductions || 0), 0).toFixed(2)}</TotalDeductions>\n`;
    xml += `    <TotalNetPay>${calculateTotal(payslips).toFixed(2)}</TotalNetPay>\n`;
    xml += '  </Summary>\n';
    
    if (generateForm.includeSummary) {
      xml += '  <DepartmentSummary>\n';
      const deptSummary = payslips.reduce((acc: any, slip) => {
        const dept = slip.department || 'Unassigned';
        if (!acc[dept]) acc[dept] = { count: 0, total: 0 };
        acc[dept].count++;
        acc[dept].total += slip.netPay || 0;
        return acc;
      }, {});
      
      Object.entries(deptSummary).forEach(([dept, data]: [string, any]) => {
        xml += '    <Department>\n';
        xml += `      <Name>${escapeXml(dept)}</Name>\n`;
        xml += `      <EmployeeCount>${data.count}</EmployeeCount>\n`;
        xml += `      <TotalNetPay>${data.total.toFixed(2)}</TotalNetPay>\n`;
        xml += '    </Department>\n';
      });
      xml += '  </DepartmentSummary>\n';
    }
    
    if (generateForm.includeDetails) {
      xml += '  <Transfers>\n';
      payslips.forEach((slip, index) => {
        xml += '    <Transfer>\n';
        xml += `      <SequenceNumber>${index + 1}</SequenceNumber>\n`;
        xml += `      <EmployeeID>${escapeXml(slip.employeeCode || slip.employeeId || '')}</EmployeeID>\n`;
        xml += `      <EmployeeName>${escapeXml(slip.employeeName || 'Unknown')}</EmployeeName>\n`;
        xml += `      <Department>${escapeXml(slip.department || 'N/A')}</Department>\n`;
        xml += '      <Earnings>\n';
        xml += `        <BaseSalary>${(slip.earnings?.baseSalary || 0).toFixed(2)}</BaseSalary>\n`;
        xml += `        <Allowances>${(slip.earnings?.allowances || 0).toFixed(2)}</Allowances>\n`;
        xml += `        <Bonuses>${(slip.earnings?.bonuses || 0).toFixed(2)}</Bonuses>\n`;
        xml += `        <Benefits>${(slip.earnings?.benefits || 0).toFixed(2)}</Benefits>\n`;
        xml += '      </Earnings>\n';
        xml += '      <Deductions>\n';
        xml += `        <Taxes>${(slip.deductionsBreakdown?.taxes || 0).toFixed(2)}</Taxes>\n`;
        xml += `        <Insurance>${(slip.deductionsBreakdown?.insurance || 0).toFixed(2)}</Insurance>\n`;
        xml += `        <Penalties>${(slip.deductionsBreakdown?.penalties || 0).toFixed(2)}</Penalties>\n`;
        xml += '      </Deductions>\n';
        xml += `      <GrossSalary>${(slip.grossSalary || 0).toFixed(2)}</GrossSalary>\n`;
        xml += `      <TotalDeductions>${(slip.deductions || 0).toFixed(2)}</TotalDeductions>\n`;
        xml += `      <NetPay>${(slip.netPay || 0).toFixed(2)}</NetPay>\n`;
        xml += '      <BankDetails>\n';
        xml += `        <BankName>${escapeXml(generateForm.bankName)}</BankName>\n`;
        xml += `        <AccountNumber>XXXX-XXXX-${String(index + 1).padStart(4, '0')}</AccountNumber>\n`;
        xml += '      </BankDetails>\n';
        xml += `      <Status>${slip.status || 'pending'}</Status>\n`;
        xml += '    </Transfer>\n';
      });
      xml += '  </Transfers>\n';
    }
    
    xml += '</BankTransferReport>';
    return xml;
  };

  // Comprehensive JSON Generation
  const generateComprehensiveJSON = (payslips: Payslip[], runDetails: PayrollRun | undefined, detailedData: any) => {
    const deptSummary = payslips.reduce((acc: any, slip) => {
      const dept = slip.department || 'Unassigned';
      if (!acc[dept]) acc[dept] = { count: 0, totalNetPay: 0, employees: [] };
      acc[dept].count++;
      acc[dept].totalNetPay += slip.netPay || 0;
      acc[dept].employees.push(slip.employeeName);
      return acc;
    }, {});

    const report = {
      header: {
        reportTitle: 'Bank Transfer File - Comprehensive Report',
        generatedDate: new Date().toISOString(),
        generatedBy: 'Payroll System',
        version: '1.0'
      },
      payrollRunInfo: {
        runId: runDetails?.runId || 'N/A',
        entity: runDetails?.entity || 'N/A',
        payrollPeriod: runDetails?.payrollPeriod || null,
        status: runDetails?.status || 'N/A',
        paymentStatus: runDetails?.paymentStatus || 'N/A',
        bankName: generateForm.bankName
      },
      summary: {
        totalEmployees: payslips.length,
        totalGrossSalary: payslips.reduce((sum, s) => sum + (s.grossSalary || 0), 0),
        totalDeductions: payslips.reduce((sum, s) => sum + (s.deductions || 0), 0),
        totalNetPay: calculateTotal(payslips),
        averageNetPay: payslips.length > 0 ? calculateTotal(payslips) / payslips.length : 0
      },
      departmentSummary: generateForm.includeSummary ? Object.entries(deptSummary).map(([name, data]: [string, any]) => ({
        department: name,
        employeeCount: data.count,
        totalNetPay: data.totalNetPay,
        averageNetPay: data.count > 0 ? data.totalNetPay / data.count : 0
      })) : undefined,
      transfers: generateForm.includeDetails ? payslips.map((slip, index) => ({
        sequenceNumber: index + 1,
        employee: {
          id: slip.employeeCode || slip.employeeId,
          name: slip.employeeName || 'Unknown',
          department: slip.department || 'N/A'
        },
        earnings: {
          baseSalary: slip.earnings?.baseSalary || 0,
          allowances: slip.earnings?.allowances || 0,
          bonuses: slip.earnings?.bonuses || 0,
          benefits: slip.earnings?.benefits || 0,
          refunds: slip.earnings?.refunds || 0
        },
        deductions: {
          taxes: slip.deductionsBreakdown?.taxes || 0,
          insurance: slip.deductionsBreakdown?.insurance || 0,
          penalties: slip.deductionsBreakdown?.penalties || 0
        },
        totals: {
          grossSalary: slip.grossSalary || 0,
          totalDeductions: slip.deductions || 0,
          netPay: slip.netPay || 0
        },
        bankDetails: {
          bankName: generateForm.bankName,
          accountNumber: `XXXX-XXXX-${String(index + 1).padStart(4, '0')}`
        },
        status: slip.status || 'pending'
      })) : undefined,
      footer: {
        totalRecords: payslips.length,
        totalAmount: calculateTotal(payslips),
        checksum: `CHK-${Date.now()}`
      }
    };

    return JSON.stringify(report, null, 2);
  };

  // HTML Report for PDF-ready printing
  const generatePDFReadyHTML = (payslips: Payslip[], runDetails: PayrollRun | undefined, detailedData: any) => {
    const totalGross = payslips.reduce((sum, s) => sum + (s.grossSalary || 0), 0);
    const totalDeductions = payslips.reduce((sum, s) => sum + (s.deductions || 0), 0);
    const totalNet = calculateTotal(payslips);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bank Transfer Report - ${runDetails?.runId || 'N/A'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #333; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
    .header h1 { color: #1e40af; font-size: 24px; margin-bottom: 5px; }
    .header p { color: #64748b; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
    .info-box h3 { color: #1e40af; margin-bottom: 10px; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
    .info-row { display: flex; justify-content: space-between; padding: 5px 0; }
    .info-row span:first-child { color: #64748b; }
    .info-row span:last-child { font-weight: 600; }
    .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .summary-card { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; border-radius: 10px; text-align: center; }
    .summary-card.green { background: linear-gradient(135deg, #16a34a, #15803d); }
    .summary-card.red { background: linear-gradient(135deg, #dc2626, #b91c1c); }
    .summary-card.purple { background: linear-gradient(135deg, #7c3aed, #6d28d9); }
    .summary-card h4 { font-size: 11px; opacity: 0.9; margin-bottom: 5px; }
    .summary-card p { font-size: 20px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #1e40af; color: white; padding: 12px 8px; text-align: left; font-size: 11px; }
    td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    tr:nth-child(even) { background: #f8fafc; }
    tr:hover { background: #eff6ff; }
    .text-right { text-align: right; }
    .text-green { color: #16a34a; }
    .text-red { color: #dc2626; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏦 Bank Transfer Report</h1>
    <p>Comprehensive Payroll Documentation</p>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>📋 Payroll Run Information</h3>
      <div class="info-row"><span>Run ID:</span><span>${runDetails?.runId || 'N/A'}</span></div>
      <div class="info-row"><span>Entity:</span><span>${runDetails?.entity || 'N/A'}</span></div>
      <div class="info-row"><span>Period:</span><span>${runDetails?.payrollPeriod ? new Date(runDetails.payrollPeriod).toLocaleDateString() : 'N/A'}</span></div>
      <div class="info-row"><span>Status:</span><span>${runDetails?.status || 'N/A'}</span></div>
    </div>
    <div class="info-box">
      <h3>🏦 Bank Information</h3>
      <div class="info-row"><span>Bank Name:</span><span>${generateForm.bankName}</span></div>
      <div class="info-row"><span>Generated:</span><span>${new Date().toLocaleString()}</span></div>
      <div class="info-row"><span>Total Transfers:</span><span>${payslips.length}</span></div>
      <div class="info-row"><span>Payment Status:</span><span>${runDetails?.paymentStatus || 'Pending'}</span></div>
    </div>
  </div>

  <div class="summary-cards">
    <div class="summary-card">
      <h4>TOTAL EMPLOYEES</h4>
      <p>${payslips.length}</p>
    </div>
    <div class="summary-card green">
      <h4>TOTAL GROSS</h4>
      <p>$${totalGross.toLocaleString()}</p>
    </div>
    <div class="summary-card red">
      <h4>TOTAL DEDUCTIONS</h4>
      <p>$${totalDeductions.toLocaleString()}</p>
    </div>
    <div class="summary-card purple">
      <h4>TOTAL NET PAY</h4>
      <p>$${totalNet.toLocaleString()}</p>
    </div>
  </div>

  <h3 style="margin-bottom: 10px; color: #1e40af;">📊 Employee Payment Details</h3>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Employee ID</th>
        <th>Name</th>
        <th>Department</th>
        <th class="text-right">Base Salary</th>
        <th class="text-right">Allowances</th>
        <th class="text-right">Gross</th>
        <th class="text-right">Deductions</th>
        <th class="text-right">Net Pay</th>
      </tr>
    </thead>
    <tbody>
      ${payslips.map((slip, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${slip.employeeCode || slip.employeeId || 'N/A'}</td>
          <td>${slip.employeeName || 'Unknown'}</td>
          <td>${slip.department || 'N/A'}</td>
          <td class="text-right">$${(slip.earnings?.baseSalary || 0).toLocaleString()}</td>
          <td class="text-right">$${(slip.earnings?.allowances || 0).toLocaleString()}</td>
          <td class="text-right">$${(slip.grossSalary || 0).toLocaleString()}</td>
          <td class="text-right text-red">-$${(slip.deductions || 0).toLocaleString()}</td>
          <td class="text-right text-green"><strong>$${(slip.netPay || 0).toLocaleString()}</strong></td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr style="background: #1e40af; color: white; font-weight: bold;">
        <td colspan="6">TOTALS</td>
        <td class="text-right">$${totalGross.toLocaleString()}</td>
        <td class="text-right">$${totalDeductions.toLocaleString()}</td>
        <td class="text-right">$${totalNet.toLocaleString()}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <p>Generated by Payroll System on ${new Date().toLocaleString()}</p>
    <p>Run ID: ${runDetails?.runId || 'N/A'} | Total Amount: $${totalNet.toLocaleString()}</p>
  </div>

  <button class="no-print" onclick="window.print()" style="position: fixed; bottom: 20px; right: 20px; padding: 15px 30px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
    🖨️ Print / Save as PDF
  </button>
</body>
</html>`;
  };

  const calculateTotal = (payslips: Payslip[]) => {
    return payslips.reduce((sum, slip) => sum + (slip.netPay || 0), 0);
  };

  const handlePreviewRun = async (run: PayrollRun) => {
    setSelectedRun(run);
    await fetchPayslipsForRun(run._id);
    setShowPreviewModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Bank Files</h1>
            <p className="text-gray-500 mt-1">Generate comprehensive bank transfer documentation from approved payroll runs</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
          >
            <Plus size={20} />
            Generate Bank File
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="text-blue-600 flex-shrink-0 mt-0.5" size={24} />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-2">📋 Comprehensive Bank File Generation</p>
              <div className="grid grid-cols-2 gap-4 text-blue-800">
                <ul className="space-y-1 list-disc list-inside">
                  <li>Full employee payment details</li>
                  <li>Earnings & deductions breakdown</li>
                  <li>Department-wise summaries</li>
                </ul>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Multiple export formats (CSV, TXT, XML, JSON, HTML)</li>
                  <li>Print-ready PDF documentation</li>
                  <li>Bank-compatible file structure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Available Runs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <Building className="text-blue-600" size={24} />
              <div>
                <h2 className="text-xl font-semibold">Available Payroll Runs</h2>
                <p className="text-sm text-gray-600">
                  {payrollRuns.length} approved run{payrollRuns.length !== 1 ? 's' : ''} ready for bank file generation
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payroll runs...</p>
            </div>
          ) : payrollRuns.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No approved payroll runs available</p>
              <p className="text-sm mt-2">Approve a payroll run first to generate bank files</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrollRuns.map((run) => (
                    <tr key={run._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-blue-500" />
                          {run.runId || run._id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {new Date(run.payrollPeriod).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{run.entity || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          {run.employees || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          {(run.totalnetpay || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          run.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          run.status === 'LOCKED' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreviewRun(run)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                            title="Preview Payslips"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setGenerateForm({ ...generateForm, runId: run._id });
                              setShowGenerateModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition"
                            title="Generate Bank File"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Generate Bank File Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileSpreadsheet className="text-blue-600" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Generate Bank File</h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payroll Run <span className="text-red-500">*</span>
                </label>
                <select
                  value={generateForm.runId}
                  onChange={(e) => setGenerateForm({ ...generateForm, runId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select Payroll Run --</option>
                  {payrollRuns.map(run => (
                    <option key={run._id} value={run._id}>
                      {run.runId || run._id} - {new Date(run.payrollPeriod).toLocaleDateString()} ({run.employees} employees)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={generateForm.bankName}
                  onChange={(e) => setGenerateForm({ ...generateForm, bankName: e.target.value })}
                  placeholder="e.g., National Bank of Egypt, Banque Misr"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Format <span className="text-red-500">*</span>
                </label>
                <select
                  value={generateForm.format}
                  onChange={(e) => setGenerateForm({ ...generateForm, format: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CSV">📊 CSV - Spreadsheet Compatible</option>
                  <option value="TXT">📄 TXT - Fixed Width Text Report</option>
                  <option value="XML">🔷 XML - Structured Bank Format</option>
                  <option value="JSON">📦 JSON - API Compatible</option>
                  <option value="PDF_DATA">🖨️ HTML - Print-Ready Report</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Include in Report:</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateForm.includeDetails}
                    onChange={(e) => setGenerateForm({ ...generateForm, includeDetails: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Employee Payment Details</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateForm.includeSummary}
                    onChange={(e) => setGenerateForm({ ...generateForm, includeSummary: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Department Summary</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateFile}
                  disabled={loading || !generateForm.runId || !generateForm.bankName}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Generate & Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Payslips Modal */}
      {showPreviewModal && selectedRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Payslips Preview</h2>
                  <p className="text-sm text-gray-500">{selectedRun.runId || selectedRun._id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading payslips...</p>
                </div>
              ) : payslips.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No payslips found for this run</p>
                  <p className="text-sm mt-2">Generate payslips first by freezing the payroll run</p>
                </div>
              ) : (
                <div>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                      <p className="text-sm opacity-90">Employees</p>
                      <p className="text-2xl font-bold">{payslips.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl">
                      <p className="text-sm opacity-90">Total Gross</p>
                      <p className="text-2xl font-bold">${payslips.reduce((sum, s) => sum + (s.grossSalary || 0), 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-xl">
                      <p className="text-sm opacity-90">Total Deductions</p>
                      <p className="text-2xl font-bold">${payslips.reduce((sum, s) => sum + (s.deductions || 0), 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                      <p className="text-sm opacity-90">Total Net Pay</p>
                      <p className="text-2xl font-bold">${calculateTotal(payslips).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Payslips Table */}
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">#</th>
                          <th className="px-4 py-3 text-left font-semibold">Employee</th>
                          <th className="px-4 py-3 text-left font-semibold">Department</th>
                          <th className="px-4 py-3 text-right font-semibold">Base Salary</th>
                          <th className="px-4 py-3 text-right font-semibold">Allowances</th>
                          <th className="px-4 py-3 text-right font-semibold">Gross</th>
                          <th className="px-4 py-3 text-right font-semibold">Deductions</th>
                          <th className="px-4 py-3 text-right font-semibold">Net Pay</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payslips.map((slip, index) => (
                          <tr key={slip._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">{slip.employeeName || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{slip.employeeCode || slip.employeeId}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{slip.department || 'N/A'}</td>
                            <td className="px-4 py-3 text-right">${(slip.earnings?.baseSalary || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-blue-600">${(slip.earnings?.allowances || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-medium">${(slip.grossSalary || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-red-600">-${(slip.deductions || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">${(slip.netPay || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankFilesPage;
