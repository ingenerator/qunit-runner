# QUnit Test Runner

A minimal Alpine-based Docker image with Node and Puppeteer
specifically built to run QUnit test suites. The container relies upon
[light-server](https://www.npmjs.com/package/light-server) to host
the contents of /workspace while
[Puppeteer](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker)
operates Google Chrome to run the QUnit test suite


### Running in Google Cloud Build

Just add this step to your cloudbuild.yaml

```yaml
steps:
    - name: 'eu.gcr.io/ingenerator-ci/qunit-runner'
```

You don't need to worry about mounting volumes as GCB automatically
mounts the workspace into /workspace of every step.

The default is to

`CMD ["test", "application/assets/js/tests/qunit_compiled.html"]`

*or they can be overridden:*

```yaml
steps:
    - name: 'eu.gcr.io/ingenerator-ci/qunit-runner'
      args: ['test', 'app/js/tests/qunit_sources.html']
```


### Running tests locally via CLI

```bash
docker run  --cap-add=SYS_ADMIN --rm -it \
            -v $PWD:/workspace \
            eu.gcr.io/ingenerator-ci/qunit-runner \
            test path/to/qunit.html
```

### Running test suite in the browser

```bash
docker run  --cap-add=SYS_ADMIN --rm -it \
            -v $PWD:/workspace \
            -p 8000:8000 \
            eu.gcr.io/ingenerator-ci/qunit-runner \
            dev
```

and then navigate to `http://localhost:8000/path/to/qunit.html`

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
