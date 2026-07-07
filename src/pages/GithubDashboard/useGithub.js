import { useState, useEffect, useMemo, useCallback } from "react";

// ---------- GitHub language colors (official palette) ----------
export const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", HTML: "#e34c26",
  CSS: "#663399", SCSS: "#c6538c", Java: "#b07219", C: "#555555", "C++": "#f34b7d",
  "C#": "#178600", Go: "#00ADD8", Rust: "#dea584", Ruby: "#701516", PHP: "#4F5D95",
  Shell: "#89e051", Vue: "#41b883", Kotlin: "#A97BFF", Swift: "#F05138", Dart: "#00B4AB",
  "Jupyter Notebook": "#DA5B0B", Dockerfile: "#384d54", Makefile: "#427819",
  "Objective-C": "#438eff", EJS: "#a91e50", Svelte: "#ff3e00", Lua: "#000080",
  PowerShell: "#012456", Batchfile: "#C1F12E", TeX: "#3D6117", R: "#198CE7",
};
export const langColor = (l) => LANG_COLORS[l] || "#8b949e";

export const fmt = (n) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n ?? 0);

export const timeAgo = (iso) => {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 3600) return Math.max(1, Math.floor(s / 60)) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  if (s < 2592000) return Math.floor(s / 86400) + "d ago";
  if (s < 31536000) return Math.floor(s / 2592000) + "mo ago";
  return Math.floor(s / 31536000) + "y ago";
};

export function useGithub(initialUser = "JunaidNayeem") {
  const [username, setUsername] = useState(initialUser);
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (user, tok) => {
    setLoading(true);
    setError(null);
    const headers = { Accept: "application/vnd.github+json" };
    if (tok) headers.Authorization = "Bearer " + tok;
    try {
      const pRes = await fetch(`https://api.github.com/users/${user}`, { headers });
      if (pRes.status === 404) throw new Error(`No GitHub user named “${user}”. Check the spelling and try again.`);
      if (pRes.status === 403) throw new Error("GitHub rate limit reached (60 requests/hour without a token). Add a personal access token or wait a bit.");
      if (!pRes.ok) throw new Error(`GitHub responded with ${pRes.status}. Try again in a moment.`);
      const p = await pRes.json();

      // Repos — paginate up to 300. With a token, /user/repos also returns private repos.
      let all = [];
      const isSelf = !!tok;
      for (let page = 1; page <= 3; page++) {
        const url = isSelf
          ? `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner`
          : `https://api.github.com/users/${user}/repos?per_page=100&page=${page}&sort=updated`;
        const r = await fetch(url, { headers });
        if (!r.ok) break;
        const batch = await r.json();
        all = all.concat(batch);
        if (batch.length < 100) break;
      }

      let ev = [];
      try {
        const eRes = await fetch(`https://api.github.com/users/${user}/events/public?per_page=30`, { headers });
        if (eRes.ok) ev = await eRes.json();
      } catch {
        /* activity is optional */
      }

      setProfile(p);
      setRepos(all);
      setEvents(ev);
      setUsername(user);
    } catch (e) {
      setError(e.message || "Couldn't reach GitHub. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(initialUser, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const stats = useMemo(() => {
    const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
    const forks = repos.reduce((a, r) => a + r.forks_count, 0);
    const watchers = repos.reduce((a, r) => a + (r.watchers_count || 0), 0);
    const openIssues = repos.reduce((a, r) => a + (r.open_issues_count || 0), 0);
    const original = repos.filter((r) => !r.fork).length;
    const langs = {};
    repos.forEach((r) => {
      if (!r.language) return;
      const w = Math.max(r.size, 1);
      langs[r.language] = langs[r.language] || { size: 0, count: 0 };
      langs[r.language].size += w;
      langs[r.language].count += 1;
    });
    const totalSize = Object.values(langs).reduce((a, l) => a + l.size, 0) || 1;
    const langList = Object.entries(langs)
      .map(([name, v]) => ({ name, pct: (v.size / totalSize) * 100, count: v.count }))
      .sort((a, b) => b.pct - a.pct);
    const topRepo = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
    return { stars, forks, watchers, openIssues, original, forked: repos.length - original, langList, topRepo };
  }, [repos]);

  const activity = useMemo(() => events.map((e) => {
    const repo = e.repo?.name?.split("/")[1] || e.repo?.name;
    switch (e.type) {
      case "PushEvent": {
        const n = e.payload?.commits?.length || e.payload?.size || 0;
        return { icon: "↑", label: `Pushed ${n} commit${n === 1 ? "" : "s"} to ${repo}`, when: e.created_at, color: "#89e051" };
      }
      case "CreateEvent":
        return { icon: "+", label: `Created ${e.payload?.ref_type} ${e.payload?.ref || repo}`, when: e.created_at, color: "#3178c6" };
      case "PullRequestEvent":
        return { icon: "⇄", label: `${e.payload?.action === "closed" ? "Closed" : "Opened"} PR in ${repo}`, when: e.created_at, color: "#A97BFF" };
      case "IssuesEvent":
        return { icon: "◦", label: `${e.payload?.action} issue in ${repo}`, when: e.created_at, color: "#f1e05a" };
      case "WatchEvent":
        return { icon: "★", label: `Starred ${e.repo?.name}`, when: e.created_at, color: "#f1e05a" };
      case "ForkEvent":
        return { icon: "⑂", label: `Forked ${e.repo?.name}`, when: e.created_at, color: "#8b949e" };
      case "PublicEvent":
        return { icon: "◉", label: `Made ${repo} public`, when: e.created_at, color: "#00ADD8" };
      default:
        return null;
    }
  }).filter(Boolean).slice(0, 12), [events]);

  return { username, profile, repos, events, stats, activity, loading, error, load };
}
