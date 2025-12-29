/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * Report Generator Utility for Payroll Reports
 * Supports PDF and Excel export formats
 */

import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { ReportFormat } from '../dto/reports/payroll-report.dto';

export class ReportGenerator {
  /**
   * Generate report in the specified format
   * @param reportData - Report data object
   * @param format - Export format (pdf, excel, json)
   * @returns Buffer for PDF/Excel, or the report data for JSON
   */
  static async generateReport(reportData: any, format: ReportFormat = ReportFormat.JSON): Promise<Buffer | any> {
    switch (format) {
      case ReportFormat.PDF:
        return this.generatePDFReport(reportData);
      case ReportFormat.EXCEL:
        return this.generateExcelReport(reportData);
      case ReportFormat.JSON:
      default:
        return reportData;
    }
  }

  /**
   * Generate PDF report
   * @param reportData - Report data object
   * @returns Buffer containing PDF data
   */
  static async generatePDFReport(reportData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Header
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text(reportData.reportType?.toUpperCase().replace(/-/g, ' ') || 'PAYROLL REPORT', {
            align: 'center',
          })
          .moveDown(0.5);

        // Report period
        if (reportData.period) {
          doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Period: ${reportData.period}`, { align: 'center' })
            .moveDown();
        }

        // Department info if available
        if (reportData.departmentId) {
          doc.fontSize(10).text(`Department ID: ${reportData.departmentId}`, { align: 'center' }).moveDown();
        }

        // Summary section
        if (reportData.summary) {
          doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Summary', { underline: true })
            .moveDown(0.3);

          doc.fontSize(10).font('Helvetica');
          Object.entries(reportData.summary).forEach(([key, value]) => {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            doc.text(`${label}: ${this.formatValue(value)}`);
          });
          doc.moveDown();
        }

        // Breakdown sections
        if (reportData.taxBreakdown) {
          this.addBreakdownSection(doc, 'Tax Breakdown', reportData.taxBreakdown);
        }

        if (reportData.insuranceBreakdown) {
          this.addInsuranceBreakdownSection(doc, 'Insurance Breakdown', reportData.insuranceBreakdown);
        }

        if (reportData.benefitsBreakdown) {
          this.addBreakdownSection(doc, 'Benefits Breakdown', reportData.benefitsBreakdown);
        }

        if (reportData.departmentBreakdown) {
          this.addBreakdownSection(doc, 'Department Breakdown', reportData.departmentBreakdown);
        }

        if (reportData.monthlyBreakdown) {
          this.addBreakdownSection(doc, 'Monthly Breakdown', reportData.monthlyBreakdown);
        }

        if (reportData.employeeBreakdown) {
          this.addEmployeeBreakdownSection(doc, 'Employee Breakdown', reportData.employeeBreakdown);
        }

        // Footer
        doc
          .fontSize(8)
          .text(`Generated at: ${new Date(reportData.generatedAt || Date.now()).toLocaleString()}`, {
            align: 'center',
          });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add breakdown section to PDF
   */
  private static addBreakdownSection(doc: any, title: string, breakdown: any[]) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(title, { underline: true })
      .moveDown(0.3);

    doc.fontSize(9).font('Helvetica');
    breakdown.forEach((item: any, index: number) => {
      doc.text(`${index + 1}. ${JSON.stringify(item, null, 2)}`).moveDown(0.2);
    });
    doc.moveDown();
  }

  /**
   * Add insurance breakdown section to PDF
   */
  private static addInsuranceBreakdownSection(doc: any, title: string, breakdown: any[]) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(title, { underline: true })
      .moveDown(0.3);

    doc.fontSize(9).font('Helvetica');
    breakdown.forEach((item: any, index: number) => {
      doc
        .text(
          `${index + 1}. ${item.insuranceName || 'Unknown'}: Employee: ${this.formatCurrency(
            item.totalEmployeeContributions,
          )}, Employer: ${this.formatCurrency(item.totalEmployerContributions)}`,
        )
        .moveDown(0.2);
    });
    doc.moveDown();
  }

  /**
   * Add employee breakdown section to PDF
   */
  private static addEmployeeBreakdownSection(doc: any, title: string, breakdown: any[]) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(title, { underline: true })
      .moveDown(0.3);

    doc.fontSize(9).font('Helvetica');
    breakdown.forEach((item: any, index: number) => {
      const empName = item.employee
        ? `${item.employee.firstName} ${item.employee.lastName} (${item.employee.employeeNumber})`
        : 'Unknown';
      doc
        .text(
          `${index + 1}. ${empName}: Gross: ${this.formatCurrency(item.totalGrossSalary)}, Net: ${this.formatCurrency(
            item.totalNetPay,
          )}`,
        )
        .moveDown(0.2);
    });
    doc.moveDown();
  }

  /**
   * Format value for display
   */
  private static formatValue(value: any): string {
    if (typeof value === 'number') {
      // Check if it's a currency value (large numbers)
      if (value > 100) {
        return this.formatCurrency(value);
      }
      return value.toString();
    }
    return String(value);
  }

  /**
   * Format currency value
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Generate Excel report
   * @param reportData - Report data object
   * @returns Buffer containing Excel file data
   */
  static async generateExcelReport(reportData: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HR System';
    workbook.created = new Date();

    // Create main summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    let currentRow = 1;

    // Title
    summarySheet.mergeCells(currentRow, 1, currentRow, 5);
    const titleCell = summarySheet.getCell(currentRow, 1);
    titleCell.value = reportData.reportType?.toUpperCase().replace(/-/g, ' ') || 'PAYROLL REPORT';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow += 2;

    // Report period
    if (reportData.period) {
      summarySheet.getCell(currentRow, 1).value = 'Period:';
      summarySheet.getCell(currentRow, 1).font = { bold: true };
      summarySheet.getCell(currentRow, 2).value = reportData.period;
      currentRow++;
    }

    // Department info
    if (reportData.departmentId) {
      summarySheet.getCell(currentRow, 1).value = 'Department ID:';
      summarySheet.getCell(currentRow, 1).font = { bold: true };
      summarySheet.getCell(currentRow, 2).value = reportData.departmentId;
      currentRow++;
    }

    currentRow++;

    // Summary section
    if (reportData.summary) {
      summarySheet.getCell(currentRow, 1).value = 'Summary';
      summarySheet.getCell(currentRow, 1).font = { size: 14, bold: true };
      summarySheet.mergeCells(currentRow, 1, currentRow, 5);
      currentRow++;

      Object.entries(reportData.summary).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        summarySheet.getCell(currentRow, 1).value = label + ':';
        summarySheet.getCell(currentRow, 1).font = { bold: true };
        summarySheet.getCell(currentRow, 2).value = this.formatValueForExcel(value);
        if (typeof value === 'number' && value > 100) {
          summarySheet.getCell(currentRow, 2).numFmt = '$#,##0.00';
        }
        currentRow++;
      });
    }

    // Add breakdown sheets
    if (reportData.taxBreakdown) {
      this.addTaxBreakdownSheet(workbook, reportData.taxBreakdown, reportData.detailedData);
    }

    if (reportData.insuranceBreakdown) {
      this.addInsuranceBreakdownSheet(workbook, reportData.insuranceBreakdown, reportData.detailedData);
    }

    if (reportData.benefitsBreakdown) {
      this.addBenefitsBreakdownSheet(workbook, reportData.benefitsBreakdown, reportData.detailedData);
    }

    if (reportData.departmentBreakdown) {
      this.addDepartmentBreakdownSheet(workbook, reportData.departmentBreakdown);
    }

    if (reportData.monthlyBreakdown) {
      this.addMonthlyBreakdownSheet(workbook, reportData.monthlyBreakdown);
    }

    if (reportData.employeeBreakdown) {
      this.addEmployeeBreakdownSheet(workbook, reportData.employeeBreakdown);
    }

    if (reportData.detailedPayslips) {
      this.addDetailedPayslipsSheet(workbook, reportData.detailedPayslips);
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Add tax breakdown sheet
   */
  private static addTaxBreakdownSheet(workbook: ExcelJS.Workbook, breakdown: any[], detailedData?: any[]) {
    const sheet = workbook.addWorksheet('Tax Breakdown');
    let row = 1;

    // Headers
    sheet.getCell(row, 1).value = 'Tax Name';
    sheet.getCell(row, 2).value = 'Total Amount';
    sheet.getCell(row, 3).value = 'Transaction Count';
    [1, 2, 3].forEach((col) => {
      sheet.getCell(row, col).font = { bold: true };
      sheet.getCell(row, col).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    });
    row++;

    // Data
    breakdown.forEach((item: any) => {
      sheet.getCell(row, 1).value = item.taxName;
      sheet.getCell(row, 2).value = item.totalAmount;
      sheet.getCell(row, 2).numFmt = '$#,##0.00';
      sheet.getCell(row, 3).value = item.transactionCount;
      row++;
    });

    // Auto-fit columns
    sheet.columns.forEach((column) => {
      column.width = 20;
    });
  }

  /**
   * Add insurance breakdown sheet
   */
  private static addInsuranceBreakdownSheet(workbook: ExcelJS.Workbook, breakdown: any[], detailedData?: any[]) {
    const sheet = workbook.addWorksheet('Insurance Breakdown');
    let row = 1;

    // Headers
    sheet.getCell(row, 1).value = 'Insurance Name';
    sheet.getCell(row, 2).value = 'Employee Contributions';
    sheet.getCell(row, 3).value = 'Employer Contributions';
    sheet.getCell(row, 4).value = 'Total Contributions';
    sheet.getCell(row, 5).value = 'Transaction Count';
    [1, 2, 3, 4, 5].forEach((col) => {
      sheet.getCell(row, col).font = { bold: true };
      sheet.getCell(row, col).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    });
    row++;

    // Data
    breakdown.forEach((item: any) => {
      sheet.getCell(row, 1).value = item.insuranceName;
      sheet.getCell(row, 2).value = item.totalEmployeeContributions;
      sheet.getCell(row, 2).numFmt = '$#,##0.00';
      sheet.getCell(row, 3).value = item.totalEmployerContributions;
      sheet.getCell(row, 3).numFmt = '$#,##0.00';
      sheet.getCell(row, 4).value = item.totalEmployeeContributions + item.totalEmployerContributions;
      sheet.getCell(row, 4).numFmt = '$#,##0.00';
      sheet.getCell(row, 5).value = item.transactionCount;
      row++;
    });

    // Auto-fit columns
    sheet.columns.forEach((column) => {
      column.width = 25;
    });
  }

  /**
   * Add benefits breakdown sheet
   */
  private static addBenefitsBreakdownSheet(workbook: ExcelJS.Workbook, breakdown: any[], detailedData?: any[]) {
    const sheet = workbook.addWorksheet('Benefits Breakdown');
    let row = 1;

    // Headers
    sheet.getCell(row, 1).value = 'Benefit Name';
    sheet.getCell(row, 2).value = 'Total Amount';
    sheet.getCell(row, 3).value = 'Transaction Count';
    [1, 2, 3].forEach((col) => {
      sheet.getCell(row, col).font = { bold: true };
      sheet.getCell(row, col).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    });
    row++;

    // Data
    breakdown.forEach((item: any) => {
      sheet.getCell(row, 1).value = item.benefitName;
      sheet.getCell(row, 2).value = item.totalAmount;
      sheet.getCell(row, 2).numFmt = '$#,##0.00';
      sheet.getCell(row, 3).value = item.transactionCount;
      row++;
    });

    // Auto-fit columns
    sheet.columns.forEach((column) => {
      column.width = 20;
    });
  }

  /**
   * Add department breakdown sheet
   */
  private static addDepartmentBreakdownSheet(workbook: ExcelJS.Workbook, breakdown: any[]) {
    const sheet = workbook.addWorksheet('Department Breakdown');
    let row = 1;

    // Headers
    sheet.getCell(row, 1).value = 'Department ID';
    sheet.getCell(row, 2).value = 'Employee Count';
    sheet.getCell(row, 3).value = 'Total Gross Salary';
    sheet.getCell(row, 4).value = 'Total Deductions';
    sheet.getCell(row, 5).value = 'Total Net Pay';
    [1, 2, 3, 4, 5].forEach((col) => {
      sheet.getCell(row, col).font = { bold: true };
      sheet.getCell(row, col).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    });
    row++;

    // Data
    breakdown.forEach((item: any) => {
      sheet.getCell(row, 1).value = item.departmentId || 'Unknown';
      sheet.getCell(row, 2).value = item.employeeCount;
      sheet.getCell(row, 3).value = item.totalGrossSalary;
      sheet.getCell(row, 3).numFmt = '$#,##0.00';
      sheet.getCell(row, 4).value = item.totalDeductions;
      sheet.getCell(row, 4).numFmt = '$#,##0.00';
      sheet.getCell(row, 5).value = item.totalNetPay;
      sheet.getCell(row, 5).numFmt = '$#,##0.00';
      row++;
    });

    // Auto-fit columns
    sheet.columns.forEach((column) => {
      column.width = 20;
    });
  }

  /**
   * Add monthly breakdown sheet
   */
  private static addMonthlyBreakdownSheet(workbook: ExcelJS.Workbook, breakdown: any[]) {
    const sheet = workbook.addWorksheet('Monthly Breakdown');
    let row = 1;

    // Headers
    sheet.getCell(row, 1).value = 'Month';
    sheet.getCell(row, 2).value = 'Payroll Runs';
    sheet.getCell(row, 3).value = 'Employee Count';
    sheet.getCell(row, 4).value = 'Total Gross Salary';
    sheet.getCell(row, 5).value = 'Total Deductions';
    sheet.getCell(row, 6).value = 'Total Net Pay';
    [1, 2, 3, 4, 5, 6].forEach((col) => {
      sheet.getCell(row, col).font = { bold: true };
      sheet.getCell(row, col).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    });
    row++;

    // Data
    breakdown.forEach((item: any) => {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      sheet.getCell(row, 1).value = monthNames[item.month - 1] || `Month ${item.month}`;
      sheet.getCell(row, 2).value = item.payrollRuns;
      sheet.getCell(row, 3).value = item.employeeCount;
      sheet.getCell(row, 4).value = item.totalGrossSalary;
      sheet.getCell(row, 4).numFmt = '$#,##0.00';
      sheet.getCell(row, 5).value = item.totalDeductions;
      sheet.getCell(row, 5).numFmt = '$#,##0.00';
      sheet.getCell(row, 6).value = item.totalNetPay;
      sheet.getCell(row, 6).numFmt = '$#,##0.00';
      row++;
    });

    // Auto-fit columns
    sheet.columns.forEach((column) => {
      column.width = 20;
    });
  }

  /**
   * Add employee breakdown sheet
   */
  private static addEmployeeBreakdownSheet(workbook: ExcelJS.Workbook, breakdown: any[]) {
    const sheet = workbook.addWorksheet('Employee Breakdown');
    let row = 1;

    // Headers
    sheet.getCell(row, 1).value = 'Employee Number';
    sheet.getCell(row, 2).value = 'Employee Name';
    sheet.getCell(row, 3).value = 'Payslip Count';
    sheet.getCell(row, 4).value = 'Total Gross Salary';
    sheet.getCell(row, 5).value = 'Total Deductions';
    sheet.getCell(row, 6).value = 'Total Net Pay';
    [1, 2, 3, 4, 5, 6].forEach((col) => {
      sheet.getCell(row, col).font = { bold: true };
      sheet.getCell(row, col).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    });
    row++;

    // Data
    breakdown.forEach((item: any) => {
      if (item.employee) {
        sheet.getCell(row, 1).value = item.employee.employeeNumber || 'N/A';
        sheet.getCell(row, 2).value = `${item.employee.firstName || ''} ${item.employee.lastName || ''}`.trim() || 'Unknown';
      } else {
        sheet.getCell(row, 1).value = 'N/A';
        sheet.getCell(row, 2).value = 'Unknown';
      }
      sheet.getCell(row, 3).value = item.payslipCount;
      sheet.getCell(row, 4).value = item.totalGrossSalary;
      sheet.getCell(row, 4).numFmt = '$#,##0.00';
      sheet.getCell(row, 5).value = item.totalDeductions;
      sheet.getCell(row, 5).numFmt = '$#,##0.00';
      sheet.getCell(row, 6).value = item.totalNetPay;
      sheet.getCell(row, 6).numFmt = '$#,##0.00';
      row++;
    });

    // Auto-fit columns
    sheet.columns.forEach((column) => {
      column.width = 20;
    });
  }

  /**
   * Add detailed payslips sheet
   */
  private static addDetailedPayslipsSheet(workbook: ExcelJS.Workbook, payslips: any[]) {
    const sheet = workbook.addWorksheet('Detailed Payslips');
    let row = 1;

    // Headers
    sheet.getCell(row, 1).value = 'Employee Number';
    sheet.getCell(row, 2).value = 'Employee Name';
    sheet.getCell(row, 3).value = 'Payroll Run';
    sheet.getCell(row, 4).value = 'Period';
    sheet.getCell(row, 5).value = 'Gross Salary';
    sheet.getCell(row, 6).value = 'Deductions';
    sheet.getCell(row, 7).value = 'Net Pay';
    sheet.getCell(row, 8).value = 'Payment Status';
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((col) => {
      sheet.getCell(row, col).font = { bold: true };
      sheet.getCell(row, col).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    });
    row++;

    // Data
    payslips.forEach((payslip: any) => {
      const employee = payslip.employee;
      sheet.getCell(row, 1).value = employee?.employeeNumber || 'N/A';
      sheet.getCell(row, 2).value =
        employee?.firstName && employee?.lastName
          ? `${employee.firstName} ${employee.lastName}`
          : 'Unknown';
      sheet.getCell(row, 3).value = payslip.payrollRun?.runId || 'N/A';
      sheet.getCell(row, 4).value = payslip.period ? new Date(payslip.period).toLocaleDateString() : 'N/A';
      sheet.getCell(row, 5).value = payslip.grossSalary || 0;
      sheet.getCell(row, 5).numFmt = '$#,##0.00';
      sheet.getCell(row, 6).value = payslip.deductions || 0;
      sheet.getCell(row, 6).numFmt = '$#,##0.00';
      sheet.getCell(row, 7).value = payslip.netPay || 0;
      sheet.getCell(row, 7).numFmt = '$#,##0.00';
      sheet.getCell(row, 8).value = payslip.paymentStatus || 'N/A';
      row++;
    });

    // Auto-fit columns
    sheet.columns.forEach((column) => {
      column.width = 18;
    });
  }

  /**
   * Format value for Excel
   */
  private static formatValueForExcel(value: any): any {
    if (typeof value === 'number') {
      return value;
    }
    if (value instanceof Date) {
      return value;
    }
    return String(value || '');
  }
}
