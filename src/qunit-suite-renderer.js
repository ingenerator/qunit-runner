const fs = require('fs');

function renderTestRunner(suite) {
    return `
        <!-- test runner -->
        <script src="https://code.jquery.com/jquery-${suite.jquery}.min.js"></script>
        <script src="https://code.jquery.com/qunit/qunit-${suite.qunit}.js"></script>
`;
}

function renderScriptList(comment, sources) {
    const scripts = sources
        .map(file => {
            return `<script src="${file}"></script>`
        })
        .join("\n");

    return `<!-- ${comment} -->` + "\n" + scripts;

}

module.exports.renderHTML = function (suite, source_files, output_file) {
    console.log(`Rendering test suite HTML ${output_file}`);
    const html = `<!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>QUnit Unit tests</title>
                <link href="https://code.jquery.com/qunit/qunit-${suite.qunit}.css" rel="stylesheet">            
            </head>
            <body>
            <div id="qunit"></div>
            <div id="qunit-fixture"></div>
            
            ${renderTestRunner(suite)}
            ${renderScriptList('Supporting libraries and helpers', suite.libraries)}
            ${renderScriptList('Raw / compiled sources under test', source_files)}            
            ${renderScriptList('Tests', suite.test_files)}
            </body>
</html>`

    fs.writeFileSync(output_file, html);
};