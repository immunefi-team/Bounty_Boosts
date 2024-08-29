#!/bin/bash

output_file="SUMMARY.md"

# Clear the output file
echo "" > $output_file

# Function to URL encode a string
url_encode() {
  local string="${1}"
  local strlen=${#string}
  local encoded=""
  local pos c o

  for (( pos=0 ; pos<strlen ; pos++ )); do
    c=${string:$pos:1}
    case "$c" in
      [a-zA-Z0-9.~_-]) o="$c" ;;
      *) printf -v o '%%%02x' "'$c"
    esac
    encoded+="$o"
  done
  echo "$encoded"
}

# Loop through each directory
for dir in */ ; do
  dir_name=$(basename "$dir")
  # Check if the directory should be skipped
  if [ "$dir_name" != "node_modules" ] && [ "$dir_name" != ".git" ] && [ "$dir_name" != "scripts" ]; then
    encoded_dir_name=$(url_encode "$dir_name")
    echo "* [$dir_name]($encoded_dir_name/README.md)" >> $output_file

    # Loop through each .md file in the directory
    for file in "$dir"*.md ; do
      file_name=$(basename "$file")
      if [ "$file_name" != "README.md" ]; then
        encoded_file_name=$(url_encode "$file_name")
        echo "    * [${file_name%.*}]($encoded_dir_name/$encoded_file_name)" >> $output_file
      fi
    done
  fi
done

ts-node scripts/generate-program-page.ts