import { 
  Controller, Get, Put, Post, Patch, Param, Body, Req, Query, Request, // <--- Added Patch
  UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeeProfileService } from './employee-profile.service';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateChangeRequestDto } from './dto/change-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Controller('employee-profile')
export class EmployeeProfileController {
  constructor(private readonly employeeProfileService: EmployeeProfileService) {}

  // ==================================================================
  // ✅ 1. SPECIFIC ROUTES (Must come BEFORE :id)
  // ==================================================================

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMyProfile(@Req() req: any) {
    console.log('--- DEBUG: /me route hit ---');
    console.log('User from Token:', req.user);
    const userId = req.user?.userId || req.user?.sub;
    console.log('Extracted UserID:', userId);
    return this.employeeProfileService.getProfileWithRole(userId);
  }

  @Get('search')
  async searchEmployees(@Query('q') query: string) {
    return this.employeeProfileService.searchEmployees(query);
  }

  @Get('team/:managerId')
  async getTeam(@Param('managerId') managerId: string) {
    return this.employeeProfileService.getTeamProfiles(managerId);
  }

  @Put('me/password')
  async changeMyPassword(@Body() body: any, @Req() req: any) {
    const userId = req?.user?.userId;
    const { oldPassword, newPassword } = body;
    return this.employeeProfileService.changePassword(userId, oldPassword, newPassword);
  }

  @Post('change-request/:requestId/approve')
  async approveRequest(@Param('requestId') requestId: string) {
    return this.employeeProfileService.approveChangeRequest(requestId);
  }
  
  @Put('admin/:id')
  async adminUpdate(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.employeeProfileService.adminUpdateProfile(id, dto);
  }

  // ==================================================================
  // ✅ 2. WILDCARD ROUTES (Must come LAST)
  // ==================================================================

  @Get('candidates')
  @UseGuards(AuthGuard('jwt'))
  async getCandidates(@Request() req) {
    return this.employeeProfileService.getAllCandidates();
  }
  @Post(':id/promote')
  async promoteCandidate(@Param('id') id: string) {
    return this.employeeProfileService.promoteToEmployee(id);
  }
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.employeeProfileService.getProfile(id);
  }

  @Put(':id/contact')
  async updateContactInfo(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.employeeProfileService.updateContactInfo(id, dto);
  }

 
 // 👇 This specific block must be in the Controller file
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string, 
    @Body('status') status: string
  ) {
    console.log('--- DEBUG: PATCH Status Hit ---'); // Add this to see if it triggers
    return this.employeeProfileService.updateStatus(id, status);
  }

  @Post(':id/change-request')
  async submitChangeRequest(
    @Param('id') id: string,
    @Body() dto: CreateChangeRequestDto,
  ) {
    return this.employeeProfileService.submitChangeRequest(
      id,
      dto.changes,
      dto.reason,
    );
  }

  @Post(':id/upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.employeeProfileService.updateProfilePicture(id, file.path);
  }
  @Get('requests/pending')
  // @UseGuards(JwtAuthGuard, RolesGuard) // Uncomment if using guards
  async getPendingRequests() {
    return this.employeeProfileService.getAllPendingRequests();
  }

  @Get('requests/my')
  async getMyRequests(@Request() req) {
    // Assuming req.user.id is populated by JWT strategy
    return this.employeeProfileService.getMyRequests(req.user.id || req.user.sub);
  }

  @Post('request')
  async submitRequest(@Body() body: any) {
    // body should contain { employeeId, changes, reason }
    return this.employeeProfileService.submitChangeRequest(body.employeeId, body.changes, body.reason);
  }
  @Patch('me/contact')
  async updateMyContact(@Request() req, @Body() body: any) {
    // req.user.id comes from the JWT token (logged in user)
    // body should contain { mobilePhone: '...', personalEmail: '...' }
    return this.employeeProfileService.updateContactInfo(req.user.id || req.user.sub, body);
  }
  @Patch('request/:id/status')
  async updateRequestStatus(@Param('id') id: string, @Body() body: { status: 'APPROVED' | 'REJECTED' }) {
    return this.employeeProfileService.updateRequestStatus(id, body.status);
  }
  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.employeeProfileService.updateEmployeeRole(id, body.role);
  }
}