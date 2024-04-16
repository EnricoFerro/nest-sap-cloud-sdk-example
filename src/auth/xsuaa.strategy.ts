import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as xsenv from '@sap/xsenv';

@Injectable()
export class XsuaaStrategy extends PassportStrategy(Strategy, 'xsuaa') {
  constructor() {
    const uaaOptions = xsenv.getServices({
      uaa: { label: 'xsuaa' }
    }).uaa;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: uaaOptions.verificationkey
    });
  }

  validate(payload: any) {
    return payload;
  }
}
