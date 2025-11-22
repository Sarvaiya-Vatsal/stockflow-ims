import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'StockMaster API - Inventory Management System';
  }
}