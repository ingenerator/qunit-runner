const path = require('path');
const fs = require('fs');

module.exports = function (manifest_file) {

    /* Private object variables */
    var
        manifest,
        base_dir;

    /* jshint latedef: nofunc */
    constructor();

    /*
     * ===========================================================================================================
     * PRIVATE METHODS
     * ===========================================================================================================
     */

    function constructor() {
        manifest = require(manifest_file);
        base_dir = path.dirname(manifest_file);
    }


    function findTestFiles(suite) {
        const tests = [];

        suite.test_dirs.forEach(
            function (rel_path) {
                const full_path = path.join(base_dir, rel_path);
                const files = fs.readdirSync(full_path);
                files.forEach(file => {
                    tests.push(path.join(full_path, file));
                });
            }
        );

        return tests;
    }

    function listJsSourcesForCompiled(compiled_file) {
        if (!manifest.js.compile[compiled_file]) {
            throw `Error: manifest file ${manifest_file} does not define a '${compiled_file}' compiled file`;
        }

        return makePathsAbsolute(manifest.js.compile[compiled_file].sources);
    }

    function makePathsAbsolute(rel_paths) {
        return rel_paths.map(rel_path => {
            return path.join(base_dir, rel_path)
        });
    }

    function convertLibraryPaths(rel_paths) {
        return rel_paths.map(rel_path => {
            if (/^https?/.test(rel_path)) {
                return rel_path;
            } else {
                return `/libs/${rel_path}`;
            }
        });
    }

    function convertLocalLibraryPaths(rel_paths) {
        return makePathsAbsolute(rel_paths)
    }

    /*
     * ===========================================================================================================
     * PUBLIC METHODS
     * ===========================================================================================================
     */

    this.eachQunitSuite = function (callback) {
        if (!manifest.js) {
            throw `Error: manifest file ${manifest_file} does not specify any 'js' options`;
        }
        if (!manifest.js.qunit_suites) {
            throw `Error: manifest file ${manifest_file} does not specify any qunit_suites`;
        }

        manifest.js.qunit_suites.forEach(function (suite_meta) {
            suite_meta.test_files = findTestFiles(suite_meta);
            suite_meta.source_files = [];
            suite_meta.compiled_sources.forEach(compiled_file => {
                listJsSourcesForCompiled(compiled_file).forEach(source => {
                    suite_meta.source_files.push(source)
                });
            });
            suite_meta.compiled_sources = makePathsAbsolute(suite_meta.compiled_sources);
            suite_meta.libraries        = convertLibraryPaths(suite_meta.libraries || []);
            suite_meta.libraries_local  = convertLocalLibraryPaths(suite_meta.libraries_local || []);
            callback(suite_meta);
        });
    };
};
