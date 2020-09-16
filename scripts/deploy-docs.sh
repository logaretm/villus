#!/usr/bin/env sh

# abort on errors
set -e

cd docs

yarn build
yarn export

cd dist
git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:logaretm/villus.git master:gh-pages

cd -