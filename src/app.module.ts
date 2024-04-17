import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BankController } from './bank/bank.controller';
import { BankService } from './bank/bank.service';

@Module({
  imports: [AuthModule],
  controllers: [AppController, BankController],
  providers: [AppService, BankService]
})
export class AppModule {}
