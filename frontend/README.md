# delta-frontend

## Summary
This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version `20.0.3` and uses [bun](https://bun.sh/) as package manager.

## Usage

### Install dependencies

```
bun install
```

### Configure environment variables
The frontend needs some configuration to know how to interact with the backend and to change its own behaviour. The project use [Angular application environments](https://angular.dev/tools/cli/environments) and [@ngx-env/builder](https://www.npmjs.com/package/@ngx-env/builder) to manage the environments variables to use. To create a new Angular environment for a debug configuration, copy the template file `environment.template.ts` and rename it to `environment.development.ts` (the names need to be exact, as Angular will look for these exact names). Read through the comments in the file to tweak each variable's value appropriately.

The `src/environments` folder contains by default :
* `environment.template.ts`, the template configuration to create new environment or to test the application.
* `environment.ts`, the release configuration, to deploy the application. This configuration use environment variables that can be set in a `.env` file at the root of the `frontend` folder. To be detected, each variable must start with the prefix `NG_APP`.

### Run app

```
bun start
```

To run the app in a production environment, you can add `--configuration production`. The default environment is the `development` environment.

### Linting code
Linting handled by [Eslint](https://eslint.org).
```
bun lint
```

## Additional Resources
For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
