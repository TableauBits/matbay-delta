import consola from "consola";
import { type Request, type Response, Router } from "express";
import { decode, type Jwt, type JwtHeader, verify } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { Err, Ok, Option, Result } from "oxide.ts";
import { HttpError, HttpStatus, sendResult } from "../utils";

const jwksUri = Option(process.env["JWKS_URI"]).expect(
    "environment variable JWKS_URI not found but is mandatory, check `.env.template`",
);
consola.info(`JWK will be fetched from ${jwksUri}`);

const intendedAudience = Option(process.env["JWT_AUD"]).expect(
    "environment variable JWT_AUD not found but is mandatory, check `.env.template`",
);
consola.info(`JWK audience will be checked against ${intendedAudience}`);

var keyring = new JwksClient({
    jwksUri: jwksUri,
});
async function getKey(header: JwtHeader): Promise<Result<string, Error>> {
    const result = await Result.safe(keyring.getSigningKey(header.kid));
    if (result.isErr()) {
        return result;
    }

    var signingKey = result.unwrap().getPublicKey();
    return Ok(signingKey);
}

async function validateToken(token: string): Promise<Result<Jwt, Error>> {
    const decodeResult = Option(decode(token, { complete: true }));
    if (decodeResult.isNone()) {
        return Err(Error("could not extract header from token"));
    }

    const decoded = decodeResult.unwrap();
    if (typeof decoded.payload === "string") {
        return Err(Error("unknown payload format"));
    }
    if (decoded.payload.aud !== intendedAudience) {
        return Err(Error("audience does not match the expected value"));
    }

    const result = await getKey(decoded.header);
    if (result.isErr()) {
        return result.mapErr((err) => Error(`failed to fetch keys from JWT header: ${err.message}`));
    }

    const publicKey = result.unwrap();
    return Result.safe(() => verify(token, publicKey, { complete: true })).mapErr((err) =>
        Error(`failed to verify token: ${err.message}`),
    );
}

async function validate(req: Request, res: Response) {
    const token = Option(req.body?.token).okOr(new HttpError(HttpStatus.BadRequest, "no token provided"));
    if (token.isErr()) {
        sendResult(token, res);
        return;
    }

    const result = (await validateToken(token.unwrap())).mapErr(
        (err) => new HttpError(HttpStatus.UnprocessableContent, `failed to validate token: ${err.message}`),
    );
    sendResult(result, res);
}

const tokenDevRouter = Router();

tokenDevRouter.post("/validate", validate);

export { tokenDevRouter, validateToken };
