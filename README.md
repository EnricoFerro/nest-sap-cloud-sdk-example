# NestJS with SAP Cloud SDK

Here a little cookbook of creating a [NestJS](https://nestjs.com/) application with [SAP Cloud SDK](https://sap.github.io/cloud-sdk/docs/js/overview) with the support of [SAP CAPM](https://cap.cloud.sap/docs/)

## Reference

* [NestJS Documentation](https://docs.nestjs.com/)
* [Sap Cloud SDK Documentation](https://sap.github.io/cloud-sdk/)
* [SAP Cloud Application Programming Model Documentation](https://cap.cloud.sap/docs/)

## Step 1 - Creation of the NestJs Application

Install the NestJs (See [Set up Development Environment](https://sap.github.io/cloud-sdk/docs/js/tutorials/getting-started/set-up-dev-environment))

```bash
npm i -g @nestjs/cli
```

Create the project

```bash
nest new <project-name>
```

At the end the project is created:

```bash
🚀  Successfully created project <project-name>
👉  Get started with the following commands:

$ cd <project-name>
$ npm run start
```

At the end review the code for the development

1. Fix the endline and the trailing comma in the `.prettierrc` file

    ```json
    {
      "singleQuote": true,
      "trailingComma": "none",
      "endOfLine": "auto",
      "printWidth": 180
    }
    ```

2. Fix in the `.eslintrc.js` for `'max-line'` rule and the `'no-unused-var'`

    ```javascript
    module.exports = {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint/eslint-plugin'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      root: true,
      env: {
        node: true,
        jest: true,
      },
      ignorePatterns: ['.eslintrc.js'],
      rules: {
        'max-len': ['warn', { code: 150, ignoreTrailingComments: true }],
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error", // or 'warn'
          {
            'argsIgnorePattern': '^_',
            'varsIgnorePattern': '^_',
            'caughtErrorsIgnorePattern": '^_'
          }
        ]
      },
    }
    ```

3. Modify `src/main.ts` adding the `process.env.port` for manage the port in the Cloud Foundry

    ```typescript
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
      await app.listen(process.env.port || 3000);
    }
    bootstrap();
    ```

## Step 2 - Init the MTA

Install the [CDS Command Line Interface](https://cap.cloud.sap/docs/tools/#cli)

```bash
npm i -g @sap/cds-dk
```

### Step 2.1 Add the MTA

Use the CDS Command Line Interface for add the MTA:

```bash
cds add mta
```

This command modify the `package.json` adding the `@sap/cds-dk` package, and add the `mta.yaml` file

Modify the `mta.yaml` for manage the NestJs project as soruce in this way:

```yaml
---
_schema-version: '3.1'
ID: nest-sap-cloud-sdk-example
version: 0.0.1
description: ""
parameters:
  enable-parallel-deployments: true
build-parameters:
  before-all:
    - builder: custom
      commands:
        - npm ci
        - npm run build
modules:
  - name: nest-sap-cloud-sdk-example-srv
    type: nodejs
    path: dist
    parameters:
      buildpack: nodejs_buildpack
    build-parameters:
      builder: npm
    provides:
      - name: srv-api # required by consumers of CAP services (e.g. approuter)
        properties:
          srv-url: ${default-url}
    requires: []
```

### Step 2.2 Add the XSUAA

Use the CDS Command Line Interface for add the XSUAA:

```bash
cds add xsuaa
```

This command modify the `package.json` adding the `@sap/xssec` package, and add in the `mta.yaml` file the `<project-name>-auth` resource.

It create the `xs-security.json` file

Modify the xs-security file adding the `xsappname` and the `tenant`:

```json
{
  "xsappname": "nest-sap-cloud-sdk-example-auth",
  "tenant-mode": "dedicated",
  "oauth2-configuration": {
    "redirect-uris": [
      "https://*.hana.ondemand.com/**"
    ]
  },
  "scopes": [],
  "attributes": [],
  "role-templates": [],
  "authorities-inheritance": false
}
```

And remove the `xsappname` and the `tenant` from the `mta.yaml`:

```yaml
resources:
  - name: nest-sap-cloud-sdk-example-auth
    type: org.cloudfoundry.managed-service
    parameters:
      service: xsuaa
      service-plan: application
      path: ./xs-security.json
```

### Step 2.3 Add the Approuter

Use the CDS Command Line Interface for add the XSUAA:

```bash
cds add approuter
```

This command modify the `mta.yaml` adding the app router application and create the path:

```tree
app/
|-> router/
    |-> default-env.json
    |-> package.json
    |-> xs-app.json
```

The `app/router/default-env.json` is a configuration file used in the localhost server.

The `app/router/xs-app.json` is the mapping in the appprouter application.

The `app/router/package.json` is the package for the approuter

Modify the `app/router/default-env.json` for mapping the nest project and for mapping this project on 8080 port:

```json
{
    "PORT": 8080,
    "destinations": [
        {
            "name": "srv-api",
            "url": "http://localhost:3000",
            "forwardAuthToken": true
        }
    ]
}
```

Generate the `.gitignore` inside the app/router for manage the node_modules directory or the global .gitignore

## Step 3 - Configure lo XSUAA for the NestJs

Reference: [NestJS - Authentication](https://docs.nestjs.com/security/authentication)

Generate the authentication module:

```bash
nest g module auth
```

Import the packages for the implement the guard

```bash
npm i -s passport-jwt 
npm i -s @nestjs/passport
npm i -s @sap/xsenv
```

Launch the creation of the strategy for the XSUAA

```bash
nest g --flat --no-spec --spec-file-suffix strategy class  xsuaa.strategy auth
```

Launch the creation of the guard for the XSUAA:

```bash
nest g --flat --no-spec guard xsuaa auth
```

Launch the creation of the Data Type Object for the User:

```bash
nest g --flat --no-spec --spec-file-suffix strategy class user dto
```

Modify the XSUAA strategy `auth/xsuaa.strategy.ts` in this way:

```typescript
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
```

Modify the XSUAA guard  `auth/xsuaa.guard.ts` in this way:

```typescript
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
```

Modify the Data Type Object `dto/user.ts` in this way:

```typescript
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
```

Generate the controller user:

```bash
nest g --no-spec controller auth
```

Modify the Controller `auth/auth.controller.ts` in this way:

```typescript
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


Modify the Module `auth/auth.module.ts` in this way:

```typescript
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
```

If necessary add the XSUAA strategy globally in the `main.ts`:

```typescript
import { XsuaaGuard } from './auth/xsuaa.guard';
...
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(new XsuaaGuard());
...
```

### Step 3.1 - Verify the XSUAA is working

For these steps is necessary to have an access to a SAP Cloud Foundry or SAP BTP.
Is necessary have the cloud foundry command line installed with the multiapp plugins installed.

See [Install the MultiApps Cloud Foundry CLI Plugin](https://developers.sap.com/tutorials/cp-cf-install-cliplugin-mta.html) for more details

The first step is to change the xs-security.json adding the localhost in redirect:

```json
{
  "xsappname": "nest-sap-cloud-sdk-example",
  "tenant-mode": "dedicated",
  "oauth2-configuration": {
    "redirect-uris": [
      "https://*.hana.ondemand.com/**",
      "http://localhost:8080/**"
    ]
  },
  "scopes": [],
  "attributes": [],
  "role-templates": [],
  "authorities-inheritance": false
}
```

If necessary login to SAP BTP:

```bash
cf login
```

At this point create the XSUAA Service:

```bash
cf create-service xsuaa application nest-sap-cloud-sdk-example-auth -c ./xs-security.json
```

Create the keys for the xsuaa, destination and connectivity:

```bash
cf create-service-key nest-sap-cloud-sdk-example-auth nest-sap-cloud-sdk-example-auth-key
```

Bind the keys to the services:

```bash
cds bind -2 nest-sap-cloud-sdk-example-auth
```

This create a `.cdsrc-private.json` file with the `[hybrid]` profile

Launch the program with cds

```bash
cds bind  --exec -- npm run start:debug
```

Do the same in the AppRouter:

```bash
cd app/router
cds bind -2 nest-sap-cloud-sdk-example-auth
```

And Launch the approuter:

```bash
cds bind  --exec -- npm run start
```

The service will be available on `http://localhost:8080` and verify using the  `http://localhost:8080/auth/user` that your user is returned

### Step 3.2 - Formalize the launch of XSUAA as NPM Script

Install as DevDependency npm-run-all:

```bash
npm i -D npm-run-all
```

Add these 3 lines as script in package.json:

```bash
  "scripts": {
    ...
    "start:approuter": "npm --prefix ./app/router run start",
    "start:fullstack": "npm-run-all --parallel start:debug start:approuter",
    "start:fullstack-cds": "cds bind --exec -- npm run start:fullstack",
    ...
```

Now is possible to test the program using the command:

```bash
npm run start:fullstack-cds
```
