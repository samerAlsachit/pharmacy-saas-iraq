import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SyncModule } from './sync/sync.module';
import { ProductsModule } from './products/products.module';
import { ReportsModule } from './reports/reports.module';
import { AppController } from './app.controller';

@Module({
  imports: [PrismaModule, AuthModule, SyncModule, ProductsModule, ReportsModule],
  controllers: [AppController],
})
export class AppModule {}
