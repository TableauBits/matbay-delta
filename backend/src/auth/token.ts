import { type Request, type Response, Router } from "express";
import { decode, type Jwt, type JwtHeader, verify } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { async_to_result, catch_to_result, Err, Ok, type Result } from "../result";
import { isNil } from "../utils";

const token_dev_router = Router();

token_dev_router.post("/validate", validate);

export { token_dev_router };

var keyring = new JwksClient({
    jwksUri: "https://dev-x6avckr07ru88ilg.us.auth0.com/.well-known/jwks.json",
});
async function getKey(header: JwtHeader): Promise<Result<string, Error>> {
    const result = await async_to_result(keyring.getSigningKey(header.kid));
    if (result.isErr()) {
        return result;
    }

    var signingKey = result.unwrap().getPublicKey();
    return Ok(signingKey);
}

async function validate_inner(req: Request): Promise<Result<Jwt, Error>> {
    const token: string | undefined = req.body?.token;
    if (isNil(token)) {
        return Err(new Error("no token provided"));
    }

    const decoded = decode(token, { complete: true });
    if (isNil(decoded)) {
        return Err(new Error("could not extract header from token"));
    }

    const result = await getKey(decoded.header);
    if (result.isErr()) {
        return result;
    }

    return catch_to_result(() => verify(token, "", { complete: true }));
}

async function validate(req: Request, res: Response) {
    const result = await validate_inner(req);
    res.send(result);
}
