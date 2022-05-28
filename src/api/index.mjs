import assert from 'assert';
import http from 'http'
import net from 'net'

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
* cid example: QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi
* metadata example:
* {
*     version: "1",
*     package: {
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

        const client = net.createConnection({ port: 6379 }, () => {
            const command = [
                "LPUSH",
                "v0:package:worker",
                Buffer.from(JSON.stringify(requestPayload)).toString('base64'),
                "\r\n"
            ].join(" ")
            console.log(command);
            client.write(command);
            client.end()
        });

        res.end(JSON.stringify(requestPayload))
    }
};

const routes = {
    "/api/v1/packages:post": handleCreatePackage
}

http.createServer(async (req, res) => {

    const { url, method } = req;
    const routePath = `${url}:${method.toLowerCase()}`;

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
}).listen(3000)