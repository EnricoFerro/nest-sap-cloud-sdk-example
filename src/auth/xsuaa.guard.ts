import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/dto/user';

@Injectable()
export class XsuaaGuard extends AuthGuard('xsuaa') implements CanActivate {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    const userFormatted: User = {
      id: user.user_name,
      name: { givenName: user.given_name, familyName: user.family_name },
      emails: [{ value: user.email }]
    };
    return userFormatted as any;
  }
}
