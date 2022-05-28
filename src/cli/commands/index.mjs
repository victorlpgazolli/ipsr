const commands = {
    download: {
        "name": "download",
        "description": "Download a remote package from ipsr registry",
        "argument": "author/bundleId",
        "options": {
            "output": {
                "command": "-o, --output <fileName>",
                "description": "file output name"
            },
            "version": {
                "command": "-v, --verion <version>",
                "description": "install from specific version"
            }
        }
    }
}

export default commands