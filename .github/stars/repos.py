# Writes repos.txt: the GitHub repository of every plugin Claude Code can
# install, from `claude plugin list --json --available` (read on stdin).
# The app works out a plugin's repository the same way (repoOf in skills.js).
import json, re, sys

MARKETPLACES = {"claude-plugins-official": "anthropics/claude-plugins-official"}
repos = set()
for p in json.load(sys.stdin)["available"]:
    s = p.get("source")
    if isinstance(s, str):
        r = MARKETPLACES.get(p.get("marketplaceName"))
    elif s.get("source") == "github":
        r = s.get("repo")
    else:
        m = re.search(r"github\.com[/:]([\w.-]+/[\w.-]+?)(?:\.git)?/?$", s.get("url", ""))
        r = m and m.group(1)
    if r:
        repos.add(r.lower())
with open(sys.argv[1], "w", encoding="utf-8", newline="\n") as f:
    f.write("\n".join(sorted(repos)) + "\n")
print("%d repositories" % len(repos), file=sys.stderr)
