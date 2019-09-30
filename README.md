# QUnit Test Runner

A minimal Alpine-based Docker image with Node and Puppeteer
specifically built to run QUnit test suites. The container relies upon
[light-server](https://www.npmjs.com/package/light-server) to host
the contents of /workspace while
[Puppeteer](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker)
operates Google Chrome to run the QUnit test suite

### Running with an asset manifest JSON

Standard usage is to run the builder using an asset-manifest.json which defines the source javascripts,
test libraries and test suites. A test suite is defined with a directory of test files, to ensure that all tests are 
included and executed.

You can see an example of an asset-manifest.json in the integration tests for this image at 
[tests/integration/manifest-json/tests/asset-manifest.json](tests/integration/manifest-json/tests/asset-manifest.json).

The expectation is you would feed this asset-manifest.json to your asset compile step, so you use
a single definition to specify all the javascript sources that make up your production compiled JS
file(s) and the related test suites.

#### named test suites

You can have as many different qunit suites as you require - generally, one per eventual compiled 
production JS file would be sensible.

In the common case where you have a single JS for the whole application, you would have a single suite. This suite would 
test all the components of the production JS in a single pass - this ensures the tests pick up any conflicts between 
classes/functions/global state etc defined in different modules:

```
{
  "js": {
     "compile": {
       "htdocs/compiled/widgets.com.min.js": {"sources": ["vendor/dependency.js", "application/js/module.js"]}
     },
     "qunit_suites": [
       {
         "name": "widgets.com",
         "test_dirs": ["application/js/tests"],
         "compiled_sources": ["htdocs/compiled/widgets.com.min.js"]
         // qunit ver, libraries, etc
       }
     ]
  }
}
```

If you serve different / additional JS in some cases - e.g. for a CMS backend, administrative users, or a widget 
embedded on other sites - you would create a suite for each JS execution context, named appropriately. If the JS 
overlaps at runtime, you may wish to similarly make your suites overlap to pick up any conflicts:

```
{
  "js": {
     "compile": {
       "htdocs/compiled/public-users.min.js": {"sources": ["vendor/dependency.js", "application/js/site.js"]},
       "htdocs/compiled/admin-users.min.js": {"sources": ["vendor/dependency.js", "application/js/admin.js"]}
     },
     "qunit_suites": [
       {
         "name": "public",
         "test_dirs": ["application/js/site/tests"],
         "compiled_sources": ["htdocs/compiled/public-users.min.js"]
         // qunit ver, libraries, etc
       },
       {
         "name": "admin",
         "test_dirs": ["application/js/site/tests", "application/js/site/admin/tests"],
         "compiled_sources": ["htdocs/compiled/public-users.min.js", "htdocs/compiled/admin-users.min.js"]
         // qunit ver, libraries, etc
       }
     ]
  }
}
```

**Note**: if you have multiple suites you must run each one separately : the runner does not support executing multiple
suites in a single pass, due to the complexity of capturing and reporting the success/failure status.

#### `-compiled` and `-sources` test runners

When you run the image with an asset manifest, it builds two standard qunit execution HTML files for
each defined test suite:

* `qunit-{suite-name}-compiled.html` - this includes the qunit runner, any required test-environment libraries, 
  the requested compiled production JS files (which must already exist) and the test files from the specified
  directory(/ies).

* `qunit-{suite-name}-sources.html` - this includes the same test environment as the `-compiled` file. However,
  it uses the asset manifest to identify and include the individual source files that would be compiled
  into the production JS. This allows you to run and rerun tests in the local development environment without 
  having to recompile your javascript after every change.
  
In the non-interactive mode (`test` command) the runner will execute and report the status of the 
`-compiled` file. In a local environment you can run either of the provided HTML endpoints (see below).

#### Including libraries

This image carries several useful qunit helper libraries, including lolex, sinon.js and jquery-mockjax.
See the [libs](libs/) directory to browse the full set. The internal http server exposes these over HTTP 
at `/libraries`. To use them in a test suite, just add the relative path to the `libraries` array. The 
compiler will render the qunit HTML with the URL to the local copy, to reduce network and project 
dependencies in your tests.

Alternatively, you can specify any additional libraries / versions by their HTTP(s) URL and they will 
be included over the network.

For example:

```
{ 
  "js": {
    // other stuff here
    "qunit_suites": [
      {
        "name": "application",
         // other stuff
         "libraries": [
           "lolex/4.1.0/lolex.js",
           "http://some.cdn/my-custom-mockjax/5.02.js"
         ]
      }
    ]
  } 
}
```  

Currently the specified qunit and jquery versions are loaded from external CDN, but they may be baked into
the image in future. 

### Running in Google Cloud Build

Just add this step to your cloudbuild.yaml

```yaml
steps:
    - name: 'eu.gcr.io/ingenerator-ci/qunit-runner'
    - args: ['test', 'asset-manifest.json', '{suite-name}']
```

You don't need to worry about mounting volumes as GCB automatically
mounts the workspace into /workspace of every step.

Note : *the default behaviour is to run the older-style process*, where the application is assumed to
have a pre-compiled qunit runner committed at `application/assets/js/tests/qunit_compiled.html`. This 
approach still works, but is deprecated in favour of the newer asset-manifest approach.

### Running tests locally via CLI

```bash
docker run  --cap-add=SYS_ADMIN --rm -it \
            -v $PWD:/workspace \
            eu.gcr.io/ingenerator-ci/qunit-runner \
            test asset-manifest.json {suite-name}
```

### Running test suite in the browser

```bash
docker run  --cap-add=SYS_ADMIN --rm -it \
            -v $PWD:/workspace \
            -p 8000:8000 \
            eu.gcr.io/ingenerator-ci/qunit-runner \
            dev asset-manifest.json
```

and then navigate to `http://localhost:8000/qunit-{suite-name}-{compiled|sources}.html`

> **Note**: Currently it will live reload the page on changes to *.html and *.js files
however this behaviour may or may not work through a docker mounted volume
on certain host operating systems. Suggestions / pull-requests welcome (or just keep mashing refresh) :)

---

#### Tips

Seeing other weird errors when launching Chrome? Try running your
container with docker run --cap-add=SYS_ADMIN when developing locally.
Since the Dockerfile adds a pptr user as a non-privileged user, it may
not have all the necessary privileges.

There is a lot of useful advice at https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker
