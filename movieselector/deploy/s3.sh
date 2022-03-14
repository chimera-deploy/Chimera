#!/usr/bin/env bash

set -e

# Get the base directory path that will be used to zip the resources before uploading to S3
base_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

cd deploy

# Create a new S3 bucket with a random name suffix because S3 bucket names must be unique
RANDOM_STRING=$(LC_ALL=C tr -dc 'a-z' </dev/urandom | head -c 10 ; echo)
S3_BUCKET_NAME=$(aws s3 mb s3://chimera-cloudformation-files-$RANDOM_STRING --region $AWS_DEFAULT_REGION | cut -d' ' -f2)

# Upload the resources to the bucket created
aws s3 cp ./ s3://$S3_BUCKET_NAME --recursive --exclude "^\." --region $AWS_DEFAULT_REGION > /dev/null
