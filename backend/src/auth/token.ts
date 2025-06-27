import consola from "consola";
import { type Request, type Response, Router } from "express";
import { decode, type Jwt, type JwtHeader, verify } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { async_to_result, catch_to_result, Err, Ok, type Result } from "../result";
import { check_nil, isNil } from "../utils";

const jwks_uri = check_nil(
    process.env["JWKS_URI"],
    "environment variable JKWS_URI not found but is mandatory, check `.env.template`",
).unwrap();
consola.info(`JWK will be fetched from ${jwks_uri}`);

const intended_audience = check_nil(
    process.env["JWT_AUD"],
    "environment variable JWT_AUD not found but is mandatory, check `.env.template`",
).unwrap();
consola.info(`JWK audience will be checked against ${intended_audience}`);

var keyring = new JwksClient({
    jwksUri: "https://dev-x6avckr07ru88ilg.us.auth0.com/.well-known/jwks.json",
});
async function getKey(header: JwtHeader): Promise<Result<string, Error>> {
    const result = await async_to_result(keyring.getSigningKey(header.kid));
    if (result.is_err()) {
        return result;
    }

    var signingKey = result.unwrap().getPublicKey();
    return Ok(signingKey);
}

async function validate_token(token: string): Promise<Result<Jwt, Error>> {
    const decoded = decode(token, { complete: true });
    if (isNil(decoded)) {
        return Err("could not extract header from token");
    }

    if (typeof decoded.payload === "string") {
        return Err("unknown payload format");
    }
    if (decoded.payload.aud !== intended_audience) {
        return Err("audience does not match the expected value");
    }

    const result = await getKey(decoded.header);
    if (result.is_err()) {
        return result;
    }

    const public_key = result.unwrap();
    return catch_to_result(() => verify(token, public_key, { complete: true }));
}

async function validate(req: Request, res: Response) {
    const token = check_nil(req.body?.token, "no token provided");
    if (token.is_err()) {
        res.send(token);
        return;
    }

    const result = await validate_token(token.value());
    res.send(result);
}

const token_dev_router = Router();

token_dev_router.post("/validate", validate);

export { token_dev_router };
