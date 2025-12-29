#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

# remove existing git folder to start fresh
rm -rf .git

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://hypeJunction.github.io
# git push -f git@github.com:hypeJunction/hypeJunction.github.io.git master

# if you are deploying to https://hypeJunction.github.io/<REPO>
git push -f git@github.com:hypeJunction/color-wizard.git main:gh-pages

cd -
