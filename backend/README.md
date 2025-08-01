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

### Run
```bash
bun start
```

## Development
### Run while watching for changes
```bash
bun watch
```

### Linting and formatting code
Code linting and formatting are handled by [biome](https://biomejs.dev/).
```bash
bun lint
bun format
# Or both at once
bun ci
```

### Database
Currently, this backend is configured to use `SQLite` through the [Drizzle ORM](https://orm.drizzle.team/). After modifying the type declarations (located in `src/db`, but may be subject to change), generate the necessary migrations with
```bash
bun x drizzle-kit generate
```

These migrations are applied automatically when the server starts, and drizzle keeps track of which migration has already been applied to only apply the necessay ones while conserving the database contents. **For this reason, you should consider the contents of the `drizzle` folder holy and never edit it manually**. It should also **always be commited in the VCS**. In case you want to "undo" a migration, use
```bash
bun x drizzle-kit down

```

but note that this will not "delete" the previous migration and instead add a new migration that will revert the previous one. Commitmigrations carefully only after thorough testing, as a faulty migration (i.e. removing a primary key column) will require manual intervention to fix.

For testing migrations locally, you can use
```bash
bun x drizzle-kit push

```
but keep in mind that this will **NOT** generate any migration files and might desync the database schema from the type declarations.
