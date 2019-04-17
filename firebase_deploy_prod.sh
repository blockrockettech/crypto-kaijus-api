#!/usr/bin/env bash

echo "Deploying Crypto Kaijus API LIVE"
firebase use cryptokaiju;
firebase deploy --only functions:api;
