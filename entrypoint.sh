#!/usr/bin/env sh

case "$1" in
    test)
        if [[ -z "$2" ]]
        then
            echo "Usage: test path/to/qunit.html"
            exit 1
        else
            file="/workspace/$2"
            if [[ -f "$file" ]]
            then
                light-server --serve /workspace --port 8000 --no-reload --quiet &
                node /qunit-runner.js http://localhost:8000/$2
            else
                echo
                echo "$file not found."
                echo "Have you mounted a volume to /workspace ?";
                exit 1
            fi
        fi
        ;;

    dev)
        light-server --serve /workspace --port 8000 --watchexp "*.js, *.html"
        ;;

    *)
        echo "Usage: {test|dev}"
        exit 1
esac
