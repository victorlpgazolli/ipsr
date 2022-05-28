#!/bin/sh
":" //# comment; exec /usr/bin/env NODE_NO_WARNINGS=1 node --experimental-json-modules --harmony "$0" "$@"

import { Command } from 'commander';
const program = new Command();
import commands from './commands/index.mjs';
import pkgJson from "./package.json" assert {type: "json"};

program
    .name(pkgJson.name)
    .description(pkgJson.description)
    .version(pkgJson.version);



program.command(commands.download.name)
    .description(commands.download.description)
    .argument(commands.download.argument)
    .option(commands.download.options.output.command, commands.download.options.output.description)
    .option(commands.download.options.version.command, commands.download.options.version.description)
// .parse()

program.parse(process.argv)
// const options = program.opts();
// console.log(options);