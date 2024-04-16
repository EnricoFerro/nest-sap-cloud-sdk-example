import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { XsuaaStrategy } from './xsuaa.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'xsuaa' }), PassportModule],
  controllers: [AuthController],
  providers: [XsuaaStrategy]
})
export class AuthModule {}
