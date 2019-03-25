#!/usr/bin/env bash

echo "Deploying Crypto Kaijus"
firebase use cryptokaiju-39233;
firebase deploy --only functions;
