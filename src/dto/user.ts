import { Request } from 'express';

class UserEmail {
  value: string;
}

export class UserName {
  givenName: string;

  familyName: string;
}

export class User {
  id: string;
  name: UserName;
  emails: [UserEmail];
}

export class AuthRequest extends Request {
  user: User;
}
