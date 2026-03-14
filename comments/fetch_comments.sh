#!/bin/bash
# YouTube 댓글 수집 스크립트
VIDEO_IDS=(
  c3lW5qDZqgk
  H3wL0KsvZr8
  1m0mgp5I8Og
  GC3TKUjG9tk
  DxO_gE7tFZI
  VfAt-acu0OQ
  flQd74XWy8U
  9reJCnjY6Xg
  AkTyRELKoNs
  pHb2lB93Tbs
  c0WmS3Px2rg
  bTPm0HWbKBw
  NE17dPqBnc4
  MuAhhkbmOgY
  dDVFRg3R0AI
  pHQkxdCKfbI
  EFPleQyonsk
)

for vid in "${VIDEO_IDS[@]}"; do
  echo "=== Fetching comments for $vid ==="
  yt-dlp --skip-download --write-comments --extractor-args "youtube:max_comments=100" \
    -o "${vid}" "https://www.youtube.com/watch?v=${vid}" 2>&1 | tail -3
  echo ""
done
echo "=== DONE ==="
