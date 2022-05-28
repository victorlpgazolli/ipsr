

import { Command } from 'commander';
const program = new Command();
import commands from './commands/index.mjs';
import axios from 'axios';
import assert from 'assert';
import { $ } from 'zx';
import semver from 'semver';
program
    .name("ipsr")
    .description("CLI for package creators upload and download CID packages from ipsr")
    .version("1.0.0");


const isValidString = (value) => !!value && typeof value === "string";
program.command(commands.download.name)
    .description(commands.download.description)
    .argument(commands.download.argument)
    .option(commands.download.options.output.command, commands.download.options.output.description)
    .action(async (packageFullName, options) => {
        try {

            const [packageName, version] = packageFullName.split("@")

            const [author, bundleId] = packageName.split("/");
            assert(isValidString(author), "author is not a valid string")

            const validVersion = semver.valid(semver.coerce(version));

            if (version) assert(isValidString(validVersion), `${version} is not a valid version`);

            const params = {
                author,
                bundleId,
                version: validVersion
            }
            try {
                const {
                    data: packageInfo
                } = await axios.get("http://localhost:3001/api/v1/package", { params });

                const {
                    output = packageInfo.fileName
                } = options;

                await $`ipfs get ${packageInfo.pathToFile} --output=${output}`;

            } catch (error) {
                console.log("Could not get package:", params);
            }
        } catch (error) {
            console.log(error.message);
        }

    })
// .parse()

program.parse(process.argv)
// const options = program.opts();
// console.log(options);