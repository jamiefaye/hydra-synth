#!/bin/bash
# One-button deployment script for Hydra projects
# Builds and deploys: hyv, extensions (vertex + inact), hydra web editor, hyg

set -e  # Exit on any error

CLOUDFRONT_DIST="EQR3IKQVVNI68"
S3_BUCKET="www.fentonia.com"

echo "========================================"
echo "  Hydra Deployment Script"
echo "========================================"
echo ""

# Step 1: Build hyv library
echo "[1/5] Building hyv library..."
cd /Users/jamie/hydrastuff/hyv
npm run build > /dev/null 2>&1
echo "  ✓ hyv built"

# Step 2: Build all extensions (vertex + inact)
echo "[2/5] Building extensions (vertex + inact)..."
npm run build:extensions > /dev/null 2>&1
echo "  ✓ extensions built"

# Step 3: Build hydra web editor
echo "[3/5] Building hydra web editor..."
cd /Users/jamie/hydrastuff/hydra
rm -rf dist/assets  # Force fresh build
npm run build > /dev/null 2>&1
echo "  ✓ hydra web editor built"

# Step 4: Build hyg Vue app
echo "[4/5] Building hyg..."
cd /Users/jamie/hydrastuff/hyg
npm run build > /dev/null 2>&1
echo "  ✓ hyg built"

# Step 5: Upload everything to S3
echo "[5/5] Uploading to S3..."

# Upload hydra web editor
cd /Users/jamie/hydrastuff/hydra
aws s3 sync dist/ s3://${S3_BUCKET}/hydra/ --acl public-read --delete --quiet
echo "  ✓ /hydra/ uploaded"

# Upload extensions
cd /Users/jamie/hydrastuff/hyv
aws s3 cp dist/extensions/vertex-webgl.es.js s3://${S3_BUCKET}/hydra-extensions/vertex/index.js --acl public-read --quiet
aws s3 cp dist/extensions/vertex-webgpu.es.js s3://${S3_BUCKET}/hydra-extensions/vertex-webgpu/index.js --acl public-read --quiet
aws s3 cp dist/extensions/inact.es.js s3://${S3_BUCKET}/hydra-extensions/inact/index.js --acl public-read --quiet
echo "  ✓ /hydra-extensions/ uploaded"

# Upload hyg
cd /Users/jamie/hydrastuff/hyg
aws s3 sync dist/ s3://${S3_BUCKET}/hyg/ --acl public-read --delete --quiet
echo "  ✓ /hyg/ uploaded"

# Invalidate CloudFront cache
echo ""
echo "Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id ${CLOUDFRONT_DIST} \
  --paths "/hydra/*" "/hydra-extensions/*" "/hyg/*" \
  --query 'Invalidation.Id' --output text)
echo "  ✓ Invalidation started: ${INVALIDATION_ID}"

echo ""
echo "========================================"
echo "  Deployment complete!"
echo "========================================"
echo ""
echo "URLs:"
echo "  https://www.fentonia.com/hydra/"
echo "  https://www.fentonia.com/hyg/"
echo "  https://www.fentonia.com/hydra-extensions/vertex/index.js"
echo "  https://www.fentonia.com/hydra-extensions/vertex-webgpu/index.js"
echo "  https://www.fentonia.com/hydra-extensions/inact/index.js"
echo ""
echo "CloudFront invalidation in progress (~30 seconds)"
echo ""
