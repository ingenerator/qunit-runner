#!/bin/bash
set -o nounset
set -o errexit

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FAILED_SUITES=""

if [ $# -eq 1 ]
then
  IMAGE_TAG=$1
else
  echo "Specify image and tag to run as first argument e.g. selftest.sh eu.gcr.io/ingenerator-ci/qunit-runner:0.1"
  exit 1
fi


run_test_suite() {
  local test_suite=$1
  local expect_result=$2
  local actual_result=''
  local newline=$'\n'

  echo ""
  echo "> Running test suite $test_suite, expecting exit code $expect_result"
  echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

  set +e
  docker run --cap-add=SYS_ADMIN --rm -v $DIR:/workspace $IMAGE_TAG test $test_suite
  actual_result=$?
  set -e

  echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

  if [ $actual_result -eq $expect_result ]
  then
    echo "[✓] $test_suite OK"
  else
    echo "[✗] $test_suite - expected exit code $expect_result, got $actual_result"
    FAILED_SUITES="$FAILED_SUITES - $test_suite$newline"
    exit 1
  fi
}

run_test_suite integration/explicit-suite/qunit-passing.html 0
run_test_suite integration/explicit-suite/qunit-failing.html 1

run_test_suite "integration/manifest-json/asset-manifest.json passing" 0
run_test_suite "integration/manifest-json/asset-manifest.json failing" 1

echo ""
echo ""
if [ -z "$FAILED_SUITES" ]
then
  echo "✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓"
  echo "All tests OK"
  echo "✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓"
else
  echo "✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗"
  echo "Some suites failed:"
  echo "$FAILED_SUITES"
  echo "✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗"
fi
