# Counts the GitHub stars of every repository listed in repos.txt (one
# owner/repo per line) and prints {"updated": ..., "stars": {repo: n}}.
# GraphQL asks for 100 repositories per request; deleted or private ones
# come back empty and are left out.
import json, os, sys, urllib.request
from datetime import datetime, timezone

def ask(query):
    req = urllib.request.Request("https://api.github.com/graphql",
        data=json.dumps({"query": query}).encode(),
        headers={"Authorization": "bearer " + os.environ["GH_TOKEN"], "User-Agent": "ClaudePanel"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r).get("data") or {}

repos = sorted({l.strip().lower() for l in open(sys.argv[1], encoding="utf-8") if "/" in l})
stars = {}
for i in range(0, len(repos), 100):
    batch = repos[i:i + 100]
    fields = "".join('r%d: repository(owner: %s, name: %s) { stargazerCount }'
                     % (j, json.dumps(r.split("/")[0]), json.dumps(r.split("/")[1])) for j, r in enumerate(batch))
    data = ask("{" + fields + "}")
    for j, r in enumerate(batch):
        if data.get("r%d" % j):
            stars[r] = data["r%d" % j]["stargazerCount"]

json.dump({"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "stars": stars},
          sys.stdout, separators=(",", ":"), sort_keys=True)
print("%d/%d repositories" % (len(stars), len(repos)), file=sys.stderr)
