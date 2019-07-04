const fs = require('fs');
const path = require('path');
const Manifest = require('./manifest');
const renderer = require('./qunit-suite-renderer');

module.exports.parseArguments = args => {
    const arguments = {
        manifest_file: args[2],
        output_dir: args[3]
    };

    if (!(arguments.manifest_file && arguments.output_dir)) {
        throw 'Error: specify manifest file path and HTML output directory as command line arguments';
    }

    fs.accessSync(arguments.manifest_file, fs.constants.R_OK);
    fs.accessSync(arguments.output_dir, fs.constants.R_OK);

    return arguments;
};

module.exports.loadManifest = manifest_file => {
    return new Manifest(manifest_file);
};

module.exports.renderSuiteHtml = (suite_meta, output_dir) => {
    const sources_suite = `qunit-${suite_meta.name}-sources.html`;
    const compiled_suite = `qunit-${suite_meta.name}-compiled.html`;

    renderer.renderHTML(suite_meta, suite_meta.source_files, path.join(output_dir, sources_suite));
    renderer.renderHTML(suite_meta, suite_meta.compiled_sources, path.join(output_dir, compiled_suite));
};