import type { Response } from "express";
import { match, type Result } from "oxide.ts";

export enum HttpStatus {
    Ok = 200,

    BadRequest = 400,
    Unauthorized = 401,
    UnprocessableContent = 422,
}

export class HttpError extends Error {
    constructor(
        public statusCode: number,
        message: string,
    ) {
        super(message);
    }
}

export function sendResult<T, E extends HttpError>(result: Result<T, E>, res: Response) {
    /** biome-ignore-start lint/style/useNamingConvention: Ok and Err here are coming from oxide.ts */
    match(result, {
        Ok: (val) => {
            res.status(200);
            res.send(val);
        },
        Err: (err) => {
            res.status(err.statusCode);
            res.send(err.message);
        },
    });
    /** biome-ignore-end lint/style/useNamingConvention: Ok and Err here are coming from oxide.ts */
}
