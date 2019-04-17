#!/usr/bin/env bash

echo "Deploying Crypto Kaijus API BETA"
firebase use cryptokaiju-beta;
firebase deploy --only functions:api;
