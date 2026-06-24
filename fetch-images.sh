#!/usr/bin/env bash
# Downloads real, relevant photos from Wikimedia Commons (no API key, downloadable license).
# Picks first genuine photo per query (skips svg/flags/maps/coats), verifies size, saves to assets/img.
set -u
IMG_DIR="$(cd "$(dirname "$0")" && pwd)/assets/img"
mkdir -p "$IMG_DIR"
UA="SapareLanding/1.0 (educational prototype)"

fetch () {
  local name="$1" query="$2" width="${3:-1600}"
  local api="https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=${width}&format=json"
  local urls
  urls=$(curl -s --max-time 40 -H "User-Agent: $UA" "$api" \
    | grep -oE '"thumburl":"[^"]+"' | sed 's/"thumburl":"//;s/"$//' | sed 's/\\\//\//g')
  local u
  while IFS= read -r u; do
    [ -z "$u" ] && continue
    echo "$u" | grep -qiE '\.svg|coat|flag|_map|locator|logo|seal|emblem|icon|diagram' && continue
    echo "$u" | grep -qiE '\.(jpg|jpeg|png)' || continue
    curl -s -L --max-time 60 -H "User-Agent: $UA" -o "$IMG_DIR/$name.jpg" "$u"
    local sz=$(stat -c%s "$IMG_DIR/$name.jpg" 2>/dev/null || echo 0)
    if [ "$sz" -gt 30000 ]; then
      echo "OK   $name.jpg  ${sz}b  <= $u"
      return 0
    fi
  done <<< "$urls"
  echo "FAIL $name  (query: $query)"
  return 1
}

# Hero slides (cinematic, presence)
fetch hero-switzerland   "Lauterbrunnen%20valley%20Switzerland"     1920
fetch hero-maldives      "Maldives%20overwater%20bungalow%20lagoon" 1920
fetch hero-cappadocia    "Cappadocia%20balloons%20sunrise"          1920
fetch hero-santorini     "Santorini%20Oia%20sunset"                 1920

# Destination cards
fetch dest-switzerland   "Matterhorn%20Zermatt"                     1200
fetch dest-uae           "Burj%20Khalifa%20Dubai%20night"           1200
fetch dest-maldives      "Maldives%20beach%20aerial"                1200
fetch dest-turkey        "Cappadocia%20hot%20air%20balloon"         1200
fetch dest-thailand      "Phi%20Phi%20Islands%20Thailand"           1200
fetch dest-egypt         "Pyramids%20of%20Giza"                     1200
fetch dest-georgia       "Gergeti%20Trinity%20Church%20Kazbegi"     1200
fetch dest-kazakhstan    "Kaindy%20Lake%20Kazakhstan"               1200

# Section band / concierge / CTA backgrounds
fetch band-concierge     "Airplane%20window%20view%20wing%20clouds" 1600
fetch band-cta           "Tropical%20beach%20palm%20sunset"         1920
echo "=== DONE ==="
ls -la "$IMG_DIR"