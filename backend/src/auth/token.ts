import consola from "consola";
import Elysia, { t } from "elysia";
import { decode, type Jwt, type JwtHeader, verify } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { asyncToResult, catchToResult, Err, Ok, type Result } from "../result";
import { checkNil, isNil } from "../utils";

const jwksUri = checkNil(
    process.env["JWKS_URI"],
    "environment variable JKWS_URI not found but is mandatory, check `.env.template`",
).unwrap();
consola.info(`JWK will be fetched from ${jwksUri}`);

const intendedAudience = checkNil(
    process.env["JWT_AUD"],
    "environment variable JWT_AUD not found but is mandatory, check `.env.template`",
).unwrap();
consola.info(`JWK audience will be checked against ${intendedAudience}`);

var keyring = new JwksClient({
    jwksUri: jwksUri,
});
async function getKey(header: JwtHeader): Promise<Result<string, Error>> {
    const result = await asyncToResult(keyring.getSigningKey(header.kid));
    if (result.isErr()) {
        return result;
    }

    var signingKey = result.unwrap().getPublicKey();
    return Ok(signingKey);
}

async function validateToken(token: string): Promise<Result<Jwt, Error>> {
    const decoded = decode(token, { complete: true });
    if (isNil(decoded)) {
        return Err("could not extract header from token");
    }

    if (typeof decoded.payload === "string") {
        return Err("unknown payload format");
    }
    if (decoded.payload.aud !== intendedAudience) {
        return Err("audience does not match the expected value");
    }

    const result = await getKey(decoded.header);
    if (result.isErr()) {
        return result;
    }

    const publicKey = result.unwrap();
    return catchToResult(() => verify(token, publicKey, { complete: true }));
}

const tokenDevRouter = new Elysia({ prefix: "/token" });

tokenDevRouter.post("/validate", async ({ body: { token } }) => (await validateToken(token)).toJSON(), {
    body: t.Object({ token: t.String() }),
});

export { tokenDevRouter, validateToken };
