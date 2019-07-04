const compiler = require('./src/suite-compiler');

const arguments = compiler.parseArguments(process.argv);
const manifest = compiler.loadManifest(arguments.manifest_file);

manifest.eachQunitSuite(suite => {
    compiler.renderSuiteHtml(suite, arguments.output_dir)
});
