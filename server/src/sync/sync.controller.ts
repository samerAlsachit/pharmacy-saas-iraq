import { Controller, Post, Get, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';

@ApiTags('Sync')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post('push')
  @ApiOperation({ summary: 'Push sync data from device' })
  push(@Body() dto: { deviceId: string; payload: any }) {
    return this.sync.push(dto.deviceId, dto.payload);
  }

  @Get('pull')
  @ApiOperation({ summary: 'Pull delta data since last sync' })
  pull(@Query('deviceId') deviceId: string, @Query('lastSync') lastSync?: string) {
    return this.sync.pull(deviceId, lastSync);
  }

  @Post('process')
  @ApiOperation({ summary: 'Process pending sync queue' })
  processQueue() {
    return this.sync.processQueue();
  }
}
