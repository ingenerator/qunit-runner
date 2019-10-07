#!/usr/bin/env sh

### -- helper functions

endswith() { case $1 in *"$2") true;; *) false;; esac; }

require_file() {
  local file=$1

  if [[ ! -f "$file" ]]
  then
    echo "$file not found."
    echo "Have you mounted a volume to /workspace?"
    exit 1
  fi
}

require_arg() {
  local arg="$1"
  local msg="$2"

  if [[ -z "$arg" ]]
  then
    echo "$msg"
    exit 1
  fi
}

### -- script execution

if endswith "$2" ".json"
then
  USING_MANIFEST=1
  DOCROOT="/docroot"
  MANIFEST_FILE="/workspace/$2"

  echo "Compiling qunit suites from asset manifest"
  node /compile-suites.js "$MANIFEST_FILE" "$DOCROOT"

else
  USING_MANIFEST=0
  DOCROOT="/workspace"
fi

case "$1" in
    test)
        if [[ $USING_MANIFEST -eq 1 ]]
        then
          require_arg "$3" "Specify suite name as argument 3"
          suite="$3"
          test_url="qunit-$suite-compiled.html"
        else
          require_arg "$2" "Specify a manifest.json or qunit runner HTML as argument 2"
          test_url="$2"
        fi

        require_file "$DOCROOT/$test_url"

        # Serve the files and run the test suite
        light-server --serve "$DOCROOT" --port 8000 --no-reload --quiet &
        node /qunit-runner.js http://localhost:8000/$test_url
        ;;

    dev)
        light-server --serve "$DOCROOT" --port 8000 --watchexp "**/*.js, **/*.html"
        ;;

    *)
        echo "Usage: {test|dev}"
        exit 1
esac
