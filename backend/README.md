# delta-backend
## Summary
MATBay delta's backend uses [bun](https://bun.sh/) as its runtime to simplify typescript support and increase speed. This has been tested with bun version `1.2.3`.

## Usage
### install dependencies

```bash
bun install
```

### run in dev mode

```bash
bun start
```

### linting and formatting code
Code linting and formatting are handled by [biome](https://biomejs.dev/).
```bash
bun lint
bun format
# Or both at once
bun ci
```
