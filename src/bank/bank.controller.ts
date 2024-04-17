import { Controller, Get, HttpStatus, InternalServerErrorException, Req, Res, UseGuards } from '@nestjs/common';
import { BankService } from './bank.service';
import { AuthRequest } from 'src/dto/user';
import { XsuaaGuard } from 'src/auth/xsuaa.guard';

@UseGuards(XsuaaGuard)
@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get('/')
  async getBank(@Req() req: AuthRequest, @Res() res) {
    try {
      let bankResponse = (await this.bankService.getBank()) as unknown as any;
      bankResponse = bankResponse && bankResponse.data && bankResponse.data.d && bankResponse.data.d.results ? bankResponse.data.d.results : [];
      res.status(HttpStatus.OK).json(bankResponse);
    } catch (error) {
      if (error.response && error.response.status) {
        res.status(error.response.status).send(error.response.statusText);
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }
}
