import { Controller, Get, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { XsuaaGuard } from './xsuaa.guard';
import { AuthRequest } from 'src/dto/user';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  @UseGuards(XsuaaGuard)
  @Get('user')
  user(@Req() req: AuthRequest, @Res() res: Response) {
    try {
      res.status(HttpStatus.OK).json(req.user);
    } catch (error) {
      res.status(500).send(error.Error);
    }
  }
}
