#!/usr/bin/env bash
set -e

SRC="src/assets/images/elsa_logo_icon_1789437654472.jpg"
BG_COLOR="#06152D"
RES="android/app/src/main/res"

echo "Generating Android mipmap icons from $SRC..."

# 1. Standard and Round Icons
declare -A ICON_SIZES=(
  ["mdpi"]=48
  ["hdpi"]=72
  ["xhdpi"]=96
  ["xxhdpi"]=144
  ["xxxhdpi"]=192
)

# Foreground adaptive icon sizes (canvas x canvas, inner logo size)
declare -A FG_CANVAS_SIZES=(
  ["mdpi"]=108
  ["hdpi"]=162
  ["xhdpi"]=216
  ["xxhdpi"]=324
  ["xxxhdpi"]=432
)

declare -A FG_LOGO_SIZES=(
  ["mdpi"]=76
  ["hdpi"]=114
  ["xhdpi"]=152
  ["xxhdpi"]=228
  ["xxxhdpi"]=304
)

for density in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  size=${ICON_SIZES[$density]}
  fg_canvas=${FG_CANVAS_SIZES[$density]}
  fg_logo=${FG_LOGO_SIZES[$density]}
  dir="$RES/mipmap-$density"
  
  mkdir -p "$dir"
  
  # Standard launcher icon (high quality resize)
  convert "$SRC" -resize "${size}x${size}^" -gravity center -extent "${size}x${size}" "$dir/ic_launcher.png"
  
  # Round launcher icon
  convert "$SRC" -resize "${size}x${size}^" -gravity center -extent "${size}x${size}" "$dir/ic_launcher_round.png"
  
  # Adaptive foreground icon (centered logo inside transparent adaptive canvas)
  convert "$SRC" -resize "${fg_logo}x${fg_logo}" -gravity center -background none -extent "${fg_canvas}x${fg_canvas}" "$dir/ic_launcher_foreground.png"
  
  echo "✓ Generated mipmap-$density icons (${size}x${size}, fg ${fg_canvas}x${fg_canvas})"
done

echo "Generating splash screens..."

# Portrait splash screens
generate_port_splash() {
  local density=$1
  local width=$2
  local height=$3
  local logo_size=$4
  local out="$RES/drawable-port-$density/splash.png"
  mkdir -p "$(dirname "$out")"
  convert -size "${width}x${height}" "xc:$BG_COLOR" \
    \( "$SRC" -resize "${logo_size}x${logo_size}" \) \
    -gravity center -composite "$out"
}

generate_land_splash() {
  local density=$1
  local width=$2
  local height=$3
  local logo_size=$4
  local out="$RES/drawable-land-$density/splash.png"
  mkdir -p "$(dirname "$out")"
  convert -size "${width}x${height}" "xc:$BG_COLOR" \
    \( "$SRC" -resize "${logo_size}x${logo_size}" \) \
    -gravity center -composite "$out"
}

generate_port_splash "mdpi" 320 480 160
generate_port_splash "hdpi" 480 800 240
generate_port_splash "xhdpi" 720 1280 340
generate_port_splash "xxhdpi" 960 1600 460
generate_port_splash "xxxhdpi" 1280 1920 600

generate_land_splash "mdpi" 480 320 160
generate_land_splash "hdpi" 800 480 240
generate_land_splash "xhdpi" 1280 720 340
generate_land_splash "xxhdpi" 1600 960 460
generate_land_splash "xxxhdpi" 1920 1280 600

# Default fallback splash
convert -size 480x800 "xc:$BG_COLOR" \
  \( "$SRC" -resize 260x260 \) \
  -gravity center -composite "$RES/drawable/splash.png"

echo "All Android launcher and splash assets successfully generated!"
