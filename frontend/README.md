# delta-frontend

## Summary
This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version `20.0.3` and uses [bun](https://bun.sh/) as package manager.

## Usage

### Install dependencies

```
bun install
```

### Configure environment variables
This frontend needs some configuration to know how to interact with the backend and to change its own behaviour.
To this end, copy the template file `src/environments/environment.ts.template` and rename it either `environment.ts` for a release configuration or to `environment.development.ts` for a debug configuration (the names need to be exact, as Angular will look for these exact names).
From there, read through the comments in the file to tweak each variable's value appropriately.

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
