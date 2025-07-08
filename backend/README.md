# delta-backend
## Summary
MATBay delta's backend uses [bun](https://bun.sh/) as its runtime to simplify typescript support and increase speed. This has been tested with bun version `1.2.3`.

## Usage
### Install dependencies
```bash
bun install
```

### Configure environment variables
This backend needs some configuration to know how to interact with the frontend and to change its own behaviour.
To this end, copy the template file `.env.template` and rename it `.env`.
From there, read through the comments in the file to tweak each variable's value appropriately.

### Run in dev mode
```bash
bun start
```

### Linting and formatting code
Code linting and formatting are handled by [biome](https://biomejs.dev/).
```bash
bun lint
bun format
# Or both at once
bun ci
```
