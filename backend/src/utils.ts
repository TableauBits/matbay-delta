import consola from "consola";
import type { NextFunction, Request, Response } from "express";
import { Err, match, Option, type Result } from "oxide.ts";

export enum HttpStatus {
    Ok = 200,

    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    UnprocessableContent = 422,

    InternalError = 500,
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

export function unwrapHTTP<T>(result: Result<T, Error>): T {
    /** biome-ignore-start lint/style/useNamingConvention: Ok and Err here are coming from oxide.ts */
    return match(result, {
        Ok: (val) => val,
        Err: (err) => {
            throw err;
        },
    });
    /** biome-ignore-end lint/style/useNamingConvention: Ok and Err here are coming from oxide.ts */
}

export function errorHandler(err: Error, _req: Request, res: Response, next: NextFunction) {
    var error: Err<HttpError>;
    if (err instanceof HttpError) {
        error = Err(err);
    } else {
        error = Err(new HttpError(HttpStatus.InternalError, `Unknown internal error: ${err}`));
    }

    sendResult(error, res);
    next();
}

export function getBody<T>(req: Request): Result<T, HttpError> {
    // Add type guard
    return Option(req.body)
        .map((val) => val as T)
        .okOr(new HttpError(HttpStatus.BadRequest, "missing body"));
}

export function getReqUID(req: Request): Result<string, HttpError> {
    return Option(req.uid).okOr(
        new HttpError(HttpStatus.InternalError, "missing uid in request, this should never happen"),
    );
}

export function getParam(req: Request, key: string): Result<string, HttpError> {
    return Option(req.params[key]).okOr(new HttpError(HttpStatus.BadRequest, `missing '${key}' from request`));
}
