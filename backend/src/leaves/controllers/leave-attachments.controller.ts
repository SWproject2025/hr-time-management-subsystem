import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Req,
  UseGuards,
  Get,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createReadStream, existsSync } from 'fs';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveAttachment } from '../models/leave-attachment.schema';
import type { Response } from 'express';

@Controller('leaves/attachments')
@UseGuards(JwtAuthGuard)
export class LeaveAttachmentsController {
  constructor(
    @InjectModel(LeaveAttachment.name)
    private leaveAttachmentModel: Model<LeaveAttachment>,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/leave-attachments',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(extname(file.originalname).toLowerCase());

        if (mimetype && extName) {
          return cb(null, true);
        }
        cb(
          new BadRequestException(
            'Only PDF, JPG, JPEG, and PNG files are allowed',
          ),
          false,
        );
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Create attachment record
    const attachment = await this.leaveAttachmentModel.create({
      fileId: file.filename,
      requestId: null, // Will be updated when request is created
      fileName: file.filename,
      originalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      uploadedBy: req.user.employeeProfileId,
      uploadedAt: new Date(),
      isActive: true,
    });

    return {
      message: 'File uploaded successfully',
      fileId: attachment._id.toString(),
      fileName: file.originalname,
      fileSize: file.size,
    };
  }

  @Get(':id')
  async getAttachment(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const attachment = await this.leaveAttachmentModel.findById(id);

    if (!attachment || !attachment.isActive) {
      throw new BadRequestException('Attachment not found');
    }

    if (!existsSync(attachment.filePath)) {
      throw new BadRequestException('File not found on disk');
    }

    const file = createReadStream(attachment.filePath);

    res.set({
      'Content-Type': attachment.fileType,
      'Content-Disposition': `inline; filename="${attachment.originalName}"`,
    });

    return new StreamableFile(file);
  }

  @Get(':id/metadata')
  async getAttachmentMetadata(@Param('id') id: string) {
    const attachment = await this.leaveAttachmentModel.findById(id);

    if (!attachment || !attachment.isActive) {
      throw new BadRequestException('Attachment not found');
    }

    return {
      fileId: attachment._id,
      fileName: attachment.originalName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      uploadedAt: attachment.uploadedAt,
    };
  }
}
