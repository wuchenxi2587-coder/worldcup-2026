#!/usr/bin/env python3
"""
Fetch latest 2026 World Cup match data from ESPN/FIFA and update matches.json
Run: python update_live_data.py
"""
import json, os, sys
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "data")
MATCHES_FILE = os.path.join(DATA_DIR, "matches.json")

# Try to import requests, fall back to urllib
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    import urllib.request
    import urllib.error
    HAS_REQUESTS = False

def fetch_url(url):
    if HAS_REQUESTS:
        r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
        return r.text
    else:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8")

def update_from_espn():
    """Scrape ESPN schedule page for latest scores"""
    print("Fetching ESPN data...")
    html = fetch_url("https://www.espn.com/soccer/schedule/_/league/fifa.world")
    
    # ESPN embeds data in __INITIAL_STATE__ or window.__EP
    # For now, we'll use a known-results approach: compare existing data with ESPN
    
    with open(MATCHES_FILE, "r", encoding="utf-8") as f:
        matches = json.load(f)
    
    updated = 0
    
    # ESPN data structure: we look for match results in the HTML
    # This is a simplified parser — in production you'd use a proper API
    for m in matches:
        if m["status"] == "finished":
            continue  # already have result
        
        match_id = m["id"]
        home = m["home"]
        away = m["away"]
        
        # Search for "home X-Y away" patterns in HTML
        import re
        pattern = re.compile(rf'{home}.*?(\d+)\s*[-–]\s*(\d+).*?{away}|{away}.*?(\d+)\s*[-–]\s*(\d+).*?{home}', re.IGNORECASE)
        result = pattern.search(html)
        
        if result:
            groups = result.groups()
            if groups[0] and groups[1]:
                m["status"] = "finished"
                m["score"] = {"home": int(groups[0]), "away": int(groups[1])}
                updated += 1
                print(f"  ✅ {match_id}: {home} {groups[0]}-{groups[1]} {away}")
            elif groups[2] and groups[3]:
                m["status"] = "finished"
                m["score"] = {"home": int(groups[3]), "away": int(groups[2])}
                updated += 1
                print(f"  ✅ {match_id}: {home} {groups[3]}-{groups[2]} {away}")
    
    if updated > 0:
        matches.sort(key=lambda m: m["date"])
        with open(MATCHES_FILE, "w", encoding="utf-8") as f:
            json.dump(matches, f, ensure_ascii=False, indent=2)
        print(f"\n✅ Updated {updated} matches!")
    else:
        print("\nNo new results found (all matches already up to date)")
    
    # Update timestamp
    meta = {
        "lastUpdate": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "totalMatches": len(matches),
        "finished": sum(1 for m in matches if m["status"] == "finished"),
        "source": "ESPN"
    }
    meta_file = os.path.join(DATA_DIR, "meta.json")
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print(f"Meta: {json.dumps(meta)}")

if __name__ == "__main__":
    os.makedirs(DATA_DIR, exist_ok=True)
    update_from_espn()
