import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attachment } from '../models/attachment.schema';
import * as fs from 'fs';
import * as util from 'util';

const unlinkAsync = util.promisify(fs.unlink);

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name)
    private attachmentModel: Model<any>,
  ) {}

  /**
   * Create attachment record
   */
  async createAttachment(data: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    uploadedBy: string;
  }) {
    const attachment = new this.attachmentModel({
      filename: data.filename,
      originalName: data.originalName,
      mimetype: data.mimetype,
      size: data.size,
      path: data.path,
      uploadedBy: new Types.ObjectId(data.uploadedBy),
    });

    return attachment.save();
  }

  /**
   * Get attachment by ID
   */
  async getAttachment(id: string) {
    const attachment = await this.attachmentModel.findById(id).lean();
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    return attachment;
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(id: string, userId: string) {
    const attachment = await this.attachmentModel.findById(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Only allow the uploader to delete (can be extended to allow HR admins)
    if (attachment.uploadedBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own attachments');
    }

    // Delete file from filesystem
    try {
      if (fs.existsSync(attachment.path)) {
        await unlinkAsync(attachment.path);
      }
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await this.attachmentModel.findByIdAndDelete(id);

    return { message: 'Attachment deleted successfully' };
  }

  /**
   * Get attachments by IDs
   */
  async getAttachmentsByIds(ids: string[]) {
    return this.attachmentModel
      .find({ _id: { $in: ids.map(id => new Types.ObjectId(id)) } })
      .lean();
  }
}
