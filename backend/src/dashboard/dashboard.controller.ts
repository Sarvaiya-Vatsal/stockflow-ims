import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { FilterMoveHistoryDto } from './dto/filter-move-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  async getKPIs() {
    return this.dashboardService.getKPIs();
  }

  @Get('recent-activity')
  async getRecentActivity(@Query('limit') limit?: number) {
    const limitNum = limit ? parseInt(limit.toString(), 10) : 20;
    return this.dashboardService.getRecentActivity(limitNum);
  }

  @Get('move-history')
  async getMoveHistory(@Query() filterDto: FilterMoveHistoryDto) {
    const filters = {
      productId: filterDto.productId,
      warehouseId: filterDto.warehouseId,
      transactionType: filterDto.transactionType,
      dateFrom: filterDto.dateFrom ? new Date(filterDto.dateFrom) : undefined,
      dateTo: filterDto.dateTo ? new Date(filterDto.dateTo) : undefined,
      page: filterDto.page || 1,
      limit: filterDto.limit || 50,
    };

    return this.dashboardService.getMoveHistory(filters);
  }
}

