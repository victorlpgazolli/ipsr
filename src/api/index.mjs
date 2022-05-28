import assert from 'assert';
import http from 'http'
import net from 'net'
import QueryString from 'qs';
import { createClient } from 'redis';
import semver from 'semver';
const redis = createClient();
await redis.connect();
const STATUS_CODES = {
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    BAD_REQUEST: 400,
    OK: 200,
}
const DEFAULT_HEADER = {
    'Content-Type': "application/json"
}

/*
* cid example: QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco
* metadata example:
* {
*     version: "1",
*     package: {
*         author: "nome",
*         fileName: "package.apk",
*         target: "mobile",
*         version: "1.0.0",
*         bundleIdentifier: "com.example"
*     }
* }
*/
const isValidString = (value) => !!value && typeof value === "string";
const AVAILABLE_TARGETS = {
    "mobile": true
}

const validateBodyFromPackage = (packageToCreate) => {
    const {
        cid,
        metadata
    } = packageToCreate;

    try {

        assert(isValidString(cid), "cid must be a string");

        assert(!!metadata, "metadata object must exist");
        assert(isValidString(metadata.version), "metadata.version must be a string");
        assert(!!metadata.package, "metadata.package object must exist");
        assert(isValidString(metadata.package?.author), "metadata.package.author must be a string");
        assert(isValidString(metadata.package?.fileName), "metadata.package.fileName must be a string");
        assert(isValidString(metadata.package?.target), "metadata.package.target must be a string");
        assert(metadata.package?.target in AVAILABLE_TARGETS, "metadata.package.target must be a valid one: " + Object.keys(AVAILABLE_TARGETS));
        assert(isValidString(metadata.package?.version), "metadata.package.version must be a string");
        assert(isValidString(metadata.package?.version), "metadata.package.version must be a string");
        assert(isValidString(metadata.package?.bundleIdentifier), "metadata.package.bundleIdentifier must be a string");

    } catch (error) {
        return error.message;
    }
    return null;
}

const handleCreatePackage = async (req, res) => {
    for await (const rawPayload of req) {
        const requestPayload = JSON.parse(rawPayload);
        const payloadError = validateBodyFromPackage(requestPayload);
        if (payloadError) {
            res.writeHeader(STATUS_CODES.BAD_REQUEST)
            return res.end(JSON.stringify({ error: payloadError }));
        }

        await redis.publish("v0:internal:worker", Buffer.from(JSON.stringify(requestPayload)).toString('base64'))

        res.end(JSON.stringify(requestPayload));
    }
};
const handleGetPackage = async (req, res) => {
    const {
        author,
        bundleId,
        version: rawVersion
    } = req.query;
    const version = semver.valid(semver.coerce(rawVersion));

    const key = [
        "v0",
        "package",
        author,
        bundleId,
        version ? version : "*"
    ].join(":");
    const [packageDesired] = await redis.keys(key);
    if (!packageDesired) {
        res.writeHeader(STATUS_CODES.NOT_FOUND);
        res.end(JSON.stringify({
            error: `package ${author}/${bundleId}@${version ? version : "latest"} not found`
        }));
        return;
    }
    const [latestFromVersion] = await redis.lRange(packageDesired, 0, 1);
    res.end(latestFromVersion);
};

const routes = {
    "/api/v1/package:get": handleGetPackage,
    "/api/v1/packages:post": handleCreatePackage,
}

http.createServer(async (req, res) => {

    const { url, method } = req;
    const [rawUrl, rawParams] = url.split("?");
    req.query = {}
    if (rawParams) {
        const params = QueryString.parse(rawParams);
        req.query = params;
    }
    const routePath = `${rawUrl}:${method.toLowerCase()}`;

    const {
        [routePath]: apiCallHandler
    } = routes

    try {
        assert(routePath in routes, STATUS_CODES.NOT_FOUND)
    } catch (error) {
        res.writeHeader(error.message);
        return res.end();
    }

    try {
        await apiCallHandler(req, res);
        res.writeHeader(STATUS_CODES.OK, DEFAULT_HEADER);
    } catch (error) {
        res.writeHeader(STATUS_CODES.INTERNAL_SERVER_ERROR);
        console.log(error)
    } finally {
        return res.end();
    }
}).listen(3001)