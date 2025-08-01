class Result<T, E extends Error> {
    #ok: T | null;
    #err: E | null;

    // prefer using Ok() or Err() instead
    constructor(ok: T | null, err: E | null) {
        if (!ok && !err) {
            throw new Error("Result must have a value or an error");
        }
        if (ok && err) {
            throw new Error("Result cannot have both a value and and error");
        }

        this.#ok = ok;
        this.#err = err;
    }

    unwrap(): T {
        if (this.isOk()) {
            return this.#ok as T;
        }

        if (this.isErr()) {
            throw this.#err as E;
        }

        throw new Error("result object is in invalid state");
    }

    expect(msg: string): T {
        if (this.isOk()) {
            return this.#ok as T;
        }

        if (this.isErr()) {
            const err = this.#err as E;
            err.message = `${msg}: \n${err.message}`;
            throw err.message;
        }

        throw new Error(msg);
    }

    isOk(): this is Result<T, never> {
        return this.#ok !== null;
    }

    value(): this extends Result<T, never> ? T : T | null {
        return this.#ok as T;
    }

    isErr(): this is Result<never, E> {
        return this.#err !== null;
    }

    getErr(): this extends Result<never, E> ? E : E | null {
        return this.#err as E;
    }

    toString(): string {
        if (this.isOk()) {
            return `Ok: ${this.#ok}`;
        }

        if (this.isErr()) {
            return `Err: ${this.#err}`;
        }

        return "[result object is in invalid state]";
    }

    toJSON(): unknown {
        if (this.isOk()) {
            return { type: "Ok", value: this.#ok };
        }

        if (this.isErr()) {
            return { type: "Err", value: `${this.#err}` };
        }

        return { type: "Invalid", value: "[result object is in an invalid state]" };
    }

    [Bun.inspect.custom]() {
        return this.toString();
    }
}

function Ok<T, E extends Error>(value: T): Result<T, E> {
    return new Result<T, E>(value, null);
}
function Err<T, E extends Error>(error: E): Result<T, E>;
function Err<T>(error: string): Result<T, Error>;

function Err<T, E extends Error>(error: E | string): Result<T, E> | Result<T, Error> {
    if (typeof error === "string") {
        const errorValue = new Error(error);
        return new Result<T, Error>(null, errorValue);
    }

    return new Result<T, E>(null, error);
}

function catchToResult<T, E extends Error>(fn: () => T): Result<T, E> {
    try {
        return Ok(fn());
    } catch (error: unknown) {
        return Err(error as E);
    }
}

async function asyncToResult<T, E extends Error>(promise: Promise<T>): Promise<Result<T, E>> {
    try {
        return Ok(await promise);
    } catch (error: unknown) {
        return Err(error as E);
    }
}

export { Result, Ok, Err, catchToResult, asyncToResult };
