import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { JournalService } from '../service/Journal.service';
import { CreateJournalEntryDto } from '../dto/journal.dto';
import { NotFoundException } from '@nestjs/common';

@Controller('journal')
export class JournalController {
  constructor(private journalService: JournalService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateJournalEntryDto) {
    return this.journalService.createJournalEntry(req.user.companyId, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    // FIX: Remove filters parameter
    return this.journalService.getJournalEntries(req.user.companyId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.journalService.getJournalEntry(req.user.companyId, id);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const entry = await this.journalService.getJournalEntry(
      req.user.companyId,
      id,
    );
    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }
    return { message: 'Journal entry deleted' };
  }
}
