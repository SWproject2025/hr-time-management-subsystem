import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../Common/Gaurds/roles.gaurd';
import { Roles } from '../../Common/Decorators/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
import { AttachmentsService } from '../services/attachments.service';

import { CurrentUser } from '../../Common/Decorators/current-user.decorator';
import type { CurrentUserData } from '../../Common/Decorators/current-user.decorator';

// Multer configuration for file upload
const storage = diskStorage({
  destination: './uploads/leave-attachments',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `leave-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow specific types
const fileFilter = (req: any, file: any, callback: any) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const ext = extname(file.originalname).toLowerCase();
  const mimetype = allowedTypes.test(file.mimetype);
  const extname_valid = allowedTypes.test(ext);

  if (mimetype && extname_valid) {
    return callback(null, true);
  }
  callback(
    new BadRequestException(
      'Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX files are allowed.',
    ),
    false,
  );
};

@Controller('leaves/attachments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /**
   * Upload attachment for leave request
   * REQ-016: Document upload for leave requests
   */
  @Post('upload')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
    }),
  )
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: CurrentUserData,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const attachment = await this.attachmentsService.createAttachment({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy: user.employeeProfileId,
    });

    return res.status(HttpStatus.CREATED).json(attachment);
  }

  /**
   * Get attachment details
   * REQ-016: View attachment details
   */
  @Get(':id')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async getAttachment(@Param('id') id: string) {
    return this.attachmentsService.getAttachment(id);
  }

  /**
   * Download attachment file
   * REQ-016: Download attachment
   */
  @Get(':id/download')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async downloadAttachment(@Param('id') id: string, @Res() res: Response) {
    const attachment = await this.attachmentsService.getAttachment(id);
    if (!attachment || Array.isArray(attachment)) {
      throw new BadRequestException('Attachment not found');
    }
    return res.download((attachment as any).path, (attachment as any).originalName);
  }


  /**
   * Delete attachment
   * REQ-016: Delete attachment
   */
  @Delete(':id')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async deleteAttachment(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.attachmentsService.deleteAttachment(id, user.employeeProfileId);
  }
}
