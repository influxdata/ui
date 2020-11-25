#!/bin/bash
HOST="$1";
PORT=$2;

# Sleep Time In Seconds
SLEEP_TIME=15;
MAX_EXECUTION_TIME=60;

SEARCH_STRING="Connected to $HOST."

BEGIN_TIME=$(date +%s);

echo "Host: $HOST";
echo "Port: $PORT";
echo "Sleep Time: $SLEEP_TIME";
echo "Max Execution Time: $MAX_EXECUTION_TIME";

while IFS=";";
do
    TOTAL=`expr $(date +%s) - $BEGIN_TIME`;

    if [ "$TOTAL" -gt "$MAX_EXECUTION_TIME" ]; then
        echo "Execution time exceeded! Exiting...";
        exit 1;
    fi

	echo "Connecting to: $HOST:$PORT";
    output="$(telnet "$HOST" "$PORT" 2>&1 < /dev/null)";
    if [[ "$output" == *"$SEARCH_STRING"* ]]; then
          echo "Connected.";
          exit 0;
    fi

	echo "Retrying in $SLEEP_TIME seconds...";
    sleep $SLEEP_TIME;
done
