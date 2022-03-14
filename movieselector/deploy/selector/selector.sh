#!/usr/bin/env bash

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"

PROJECT_NAME="chimera"
ECR_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com"
VERSION="1"
#MOVIE_SERVER_IMAGE="$ECR_URL/movieserver:$VERSION.0"
MOVIE_SELECTOR_IMAGE="$ECR_URL/movieselector:$VERSION.0"
#MOVIE_UI_IMAGE="$ECR_URL/movieui:$VERSION.0"
STACK_NAME="$PROJECT_NAME-movieselector-$VERSION"

echo "Deploying stack $STACK_NAME to $AWS_DEFAULT_REGION, which might take a few minutes..."
aws cloudformation deploy \
    --region "$AWS_DEFAULT_REGION" \
    --no-fail-on-empty-changeset \
    --stack-name "$STACK_NAME" \
    --template-file "$DIR/selector.yaml" \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
    ProjectName=$PROJECT_NAME \
    EnvoyImage=$ENVOY_IMAGE \
    MovieSelectorImage=$MOVIE_SELECTOR_IMAGE \
    Version=$VERSION
