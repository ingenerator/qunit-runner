#! /usr/bin/env node

var args = process.argv.slice(2);

if (args.length < 1 || args.length > 2) {
  console.log("Usage: node qunit-runner.js <URL> <timeout>");
  process.exit(1);
}

const targetURL = args[0];
const timeout = parseInt(args[1] || 300000, 10);

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: [
      // This will write shared memory files into /tmp instead of /dev/shm,
      // because Docker’s default for /dev/shm is 64MB
      '--disable-dev-shm-usage'
    ]
  });
  const page = await browser.newPage();

// Attach to browser console log events, and log to node console
  await page.on('console', (...params) => {
    console.log("\n---------------------\nFrom browser console: ");
    for (let i = 0; i < params.length; ++i) {
      if (params[i]._text) {
        console.log(params[i]._text);
      } else {
        console.log(params[i]);
      }
    }
    console.log("---------------------");
  });

  var moduleErrors = [];
  var testErrors = [];
  var assertionErrors = [];

  await page.exposeFunction('harness_moduleDone', context => {
    if (context.failed) {
      var msg = "Module Failed: " + context.name + "\n" + testErrors.join("\n");
      moduleErrors.push(msg);
      testErrors = [];
    }
  });

  await page.exposeFunction('harness_testDone', context => {
    if (context.failed) {
      var msg = "  Test Failed: " + context.name + assertionErrors.join("    ");
      testErrors.push(msg);
      assertionErrors = [];
      process.stdout.write("F");
    } else {
      process.stdout.write(".");
    }
  });

  await page.exposeFunction('harness_log', context => {
    if (context.result) { return; } // If success don't log

    var msg = "\n    Assertion Failed:";
    if (context.message) {
      msg += " " + context.message;
    }

    if (context.expected) {
      msg += "\n      Expected: " + JSON.stringify(context.expected) + ", Actual: " + JSON.stringify(context.actual);
    }

    assertionErrors.push(msg);
  });

  await page.exposeFunction('harness_done', context => {
    console.log("\n");

    if (moduleErrors.length > 0) {
      for (var idx=0; idx<moduleErrors.length; idx++) {
        console.error(moduleErrors[idx]+"\n");
      }
    }

    var stats = [
      "Time: " + context.runtime + "ms",
      "Total: " + context.total,
      "Passed: " + context.passed,
      "Failed: " + context.failed
    ];
    console.log(stats.join(", "));

    browser.close();
    if (context.failed > 0){
      process.exit(1);
    }else{
      process.exit();
    }
  });

  await page.goto(targetURL);

  await page.evaluate(() => {
    QUnit.config.testTimeout = 10000;

// Cannot pass the window.harness_blah methods directly, because they are
// automatically defined as async methods, which QUnit does not support
    QUnit.moduleDone((context) => { window.harness_moduleDone(context); });
    QUnit.testDone((context) => { window.harness_testDone(context); });
    QUnit.log((context) => { window.harness_log(context); });
    QUnit.done((context) => { window.harness_done(context); });

    console.log("\nRunning: " + JSON.stringify(QUnit.urlParams) + "\n");
  });

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  await wait(timeout);

  console.error("Tests timed out");
  browser.close();
  process.exit(124);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
