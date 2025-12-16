#!/bin/bash

echo "{" > data/manifest.json
echo "  \"generated\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"," >> data/manifest.json
echo "  \"files\": [" >> data/manifest.json

# List all JSONL files
first=true
for file in data/*.jsonl; do
if [ -f "$file" ]; then
filename=$(basename "$file")
[ "$first" = false ] && echo "," >> data/manifest.json
echo -n "    \"$filename\"" >> data/manifest.json
first=false
fi
done

echo "" >> data/manifest.json
echo "  ]" >> data/manifest.json
echo "}" >> data/manifest.json

echo "Generated manifest.json"
cat data/manifest.json
