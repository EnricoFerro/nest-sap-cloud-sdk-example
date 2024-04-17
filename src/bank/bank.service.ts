import { Injectable } from '@nestjs/common';
import { HttpRequestConfig, executeHttpRequest } from '@sap-cloud-sdk/http-client';

@Injectable()
export class BankService {
  /**
   * GET /bank
   *
   * @returns body
   */
  async getBank() {
    const requestConfig: HttpRequestConfig = {
      method: 'GET',
      url: `/sap/opu/odata/sap/API_BANKDETAIL_SRV/A_BankDetail?$inlinecount=none`
    };
    return await executeHttpRequest({ destinationName: 'S4Hana' }, requestConfig);
  }
}
