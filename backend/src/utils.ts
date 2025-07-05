import { Err, Ok, type Result } from "./result";

function isNil(value: unknown): value is null | undefined {
    return value == null;
}

function checkNil<T>(value: T | null | undefined, error: string): Result<T, Error> {
    if (isNil(value)) {
        return Err(error);
    }

    return Ok(value);
}

export { isNil, checkNil };
