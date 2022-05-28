import assert from 'assert';
import http from 'http'
import { createClient } from 'redis';
import * as IPFS from 'ipfs-core'
import semver from 'semver'

const redisClient = createClient();
const subscriber = createClient();

const [
    ipfs,
] = await Promise.all([
    IPFS.create({ silent: true }),
    subscriber.connect(),
    redisClient.connect(),
])
console.log("ipfs & redis connected!");
// const ipfs = ipfsCreateClient();




const WORKER_KEY = "v0:internal:worker"

/*
* cid example: QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco
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

const handleSubscription = async rawMessage => {
    const payload = JSON.parse(
        Buffer.from(rawMessage, 'base64').toString("ascii")
    );
    const {
        package: {
            author,
            fileName,
            version,
            bundleIdentifier
        }
    } = payload.metadata;

    const validVersion = semver.valid(semver.coerce(version))

    if (!validVersion) {
        console.log("version do not match semver validation");
        return
    }

    const directoryPath = [
        "/ipfs",
        payload.cid,
    ].join("/");

    const pathToFile = [directoryPath, fileName].join("/");

    const desiredFiles = []

    for await (const file of ipfs.ls(directoryPath)) {
        const isDesiredFile = file.name === fileName;
        if (!isDesiredFile) continue;
        desiredFiles.push(file);
        break;
    };

    const [desiredPackageFile] = desiredFiles
    const isMissingPackageFile = !desiredPackageFile;

    if (isMissingPackageFile) {
        console.log("file do not exist");
        return;
    }

    const {
        size,
        type,
    } = desiredPackageFile;

    const isAFile = type === "file";

    if (!isAFile) {
        console.log("sended file was not a file: ", type);
        return;
    }

    const fileKey = [
        "v0",
        "package",
        author,
        bundleIdentifier,
        validVersion
    ].join(":");

    const filePayload = {
        pathToFile,
        size,
        fileName,
        version: validVersion,
        bundleIdentifier
    }

    await redisClient.lPush(fileKey, JSON.stringify(filePayload));
}



subscriber.subscribe(WORKER_KEY, (rawMessage) => {
    handleSubscription(rawMessage)
})

process.on("uncaughtException", error => {
    console.error("uncaughtException:", error.message)
})
process.on("unhandledRejection", error => {
    console.error("unhandledRejection:", error.message)
})