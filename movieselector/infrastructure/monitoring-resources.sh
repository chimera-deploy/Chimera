#!/usr/bin/env bash

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"

PROJECT_NAME="chimera"
STACK_NAME="$PROJECT_NAME-monitoring-resources"
#ECR_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com"
#MOVIE_SERVER_IMAGE="$ECR_URL/movieserver"
#MOVIE_SELECTOR_IMAGE="$ECR_URL/movieselector"
#MOVIE_UI_IMAGE="$ECR_URL/movieui"

echo "Deploying stack $STACK_NAME to $AWS_DEFAULT_REGION, which might take a few minutes..."
aws cloudformation deploy \
    --region "$AWS_DEFAULT_REGION" \
    --no-fail-on-empty-changeset \
    --stack-name "$STACK_NAME" \
    --template-file "$DIR/monitoring-resources.yaml" \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
    ProjectName=$PROJECT_NAME 
