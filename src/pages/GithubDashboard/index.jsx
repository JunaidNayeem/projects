import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useGithub, langColor, fmt, timeAgo } from "./useGithub";
import Tilt from "./Tilt";
import "./github.css";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function GithubDashboard() {
  const { profile, repos, stats, activity, loading, error, load } = useGithub("JunaidNayeem");

  const [input, setInput] = useState("JunaidNayeem");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [sortBy, setSortBy] = useState("updated");
  const [langFilter, setLangFilter] = useState("all");
  const [query, setQuery] = useState("");

  const rootRef = useRef(null);
  const repoGridRef = useRef(null);

  // ----- Lenis smooth scrolling, driven by the GSAP ticker -----
  useEffect(() => {
    if (reducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // ----- entrance + scroll animations, wired once profile data is on screen -----
  useLayoutEffect(() => {
    if (!profile || reducedMotion()) return;

    const ctx = gsap.context(() => {
      // hero entrance
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".gh-hero-kicker", { y: 24, autoAlpha: 0, rotate: -8 }, { y: 0, autoAlpha: 1, rotate: -1.5, duration: 0.55 })
        .fromTo(".gh-hero-name", { y: 60, autoAlpha: 0, rotateX: 35 }, { y: 0, autoAlpha: 1, rotateX: 0, duration: 0.8 }, "-=0.3")
        .fromTo(".gh-hero-handle, .gh-hero-bio", { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.1 }, "-=0.45")
        .fromTo(".gh-chip", { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.07 }, "-=0.3")
        .fromTo(".gh-avatar-wrap", { autoAlpha: 0, scale: 0.8, rotationY: -40 }, { autoAlpha: 1, scale: 1, rotationY: 0, duration: 0.9, ease: "back.out(1.4)" }, 0.25);

      // avatar idle float
      gsap.to(".gh-avatar-wrap", {
        y: -14,
        rotation: 1.2,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.2,
      });

      // backdrop orbs drift with scroll (parallax)
      gsap.to(".gh-orb--violet", {
        yPercent: 45, xPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: ".gh-main", start: "top top", end: "bottom bottom", scrub: 1.2 },
      });
      gsap.to(".gh-orb--cyan", {
        yPercent: -35, xPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: ".gh-main", start: "top top", end: "bottom bottom", scrub: 1.5 },
      });
      gsap.to(".gh-orb--acid", {
        yPercent: -60,
        ease: "none",
        scrollTrigger: { trigger: ".gh-main", start: "top top", end: "bottom bottom", scrub: 2 },
      });

      // generic section reveals
      gsap.utils.toArray(".gh-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 56, rotateX: 8 },
          {
            autoAlpha: 1, y: 0, rotateX: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });

      // stat tiles: staggered pop + number count-up
      gsap.utils.toArray(".gh-stat").forEach((tile, i) => {
        gsap.fromTo(
          tile,
          { autoAlpha: 0, y: 50, rotateX: 25 },
          {
            autoAlpha: 1, y: 0, rotateX: 0,
            duration: 0.7,
            delay: (i % 5) * 0.08,
            ease: "back.out(1.6)",
            scrollTrigger: { trigger: tile, start: "top 90%" },
          }
        );
        const valueEl = tile.querySelector("[data-count]");
        if (!valueEl) return;
        const target = Number(valueEl.dataset.count) || 0;
        const counter = { v: 0 };
        gsap.to(counter, {
          v: target,
          duration: 1.4,
          delay: (i % 5) * 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: tile, start: "top 90%" },
          onUpdate: () => { valueEl.textContent = fmt(Math.round(counter.v)); },
        });
      });

      // language bar grows in
      gsap.fromTo(
        ".gh-lang-seg",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          stagger: 0.06,
          ease: "power3.inOut",
          scrollTrigger: { trigger: ".gh-lang-bar", start: "top 88%" },
        }
      );

      // activity rows cascade
      gsap.fromTo(
        ".gh-activity-row",
        { autoAlpha: 0, x: -34 },
        {
          autoAlpha: 1, x: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: { trigger: ".gh-activity", start: "top 88%" },
        }
      );
    }, rootRef);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [profile]);

  const shownRepos = useMemo(() => {
    let list = repos.filter((r) =>
      (langFilter === "all" || r.language === langFilter) &&
      (query === "" || r.name.toLowerCase().includes(query.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(query.toLowerCase()))
    );
    if (sortBy === "stars") list = [...list].sort((a, b) => b.stargazers_count - a.stargazers_count);
    else if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "created") list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else list = [...list].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
    return list;
  }, [repos, sortBy, langFilter, query]);

  // repo cards animate in on every filter / sort / load change
  useEffect(() => {
    if (reducedMotion() || !repoGridRef.current || shownRepos.length === 0) return;
    const cards = repoGridRef.current.querySelectorAll(".gh-repo-card");
    const tween = gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 44, rotateX: 14 },
      { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.045, ease: "power3.out", overwrite: "auto" }
    );
    return () => tween.kill();
  }, [shownRepos]);

  const go = () => input.trim() && load(input.trim(), token.trim());

  const marqueeItems = profile
    ? [
        `${repos.length} repositories`,
        `${fmt(stats.stars)} stars earned`,
        `${fmt(stats.forks)} forks`,
        `${fmt(profile.followers)} followers`,
        `${stats.langList.length} languages`,
        profile.location || "open source",
        `on github since ${new Date(profile.created_at).getFullYear()}`,
      ]
    : [];

  return (
    <div className="gh-root" ref={rootRef}>
      {/* animated backdrop */}
      <div className="gh-backdrop" aria-hidden="true">
        <div className="gh-orb gh-orb--violet" />
        <div className="gh-orb gh-orb--cyan" />
        <div className="gh-orb gh-orb--acid" />
        <div className="gh-grid-lines" />
      </div>

      {/* top bar */}
      <nav className="gh-nav">
        <div className="gh-nav-inner">
          <span className="gh-logo">
            <span className="gh-logo-mark">⌥</span>
            DEV<span style={{ color: "var(--acid)" }}>/</span>FOLIO
          </span>
          <span className="mono gh-label">github.com/</span>
          <input
            className="gh-input"
            style={{ width: 160 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder="username"
            aria-label="GitHub username"
          />
          <button className="gh-btn" onClick={go}>
            {loading ? "Fetching…" : "Load"}
          </button>
          <button className="gh-btn gh-btn--ghost" onClick={() => setShowToken(!showToken)}>
            {showToken ? "Hide token" : "Add token"}
          </button>
          {showToken && (
            <input
              className="gh-input"
              style={{ flex: "1 1 240px" }}
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_… raises rate limit, unlocks private repos"
              aria-label="GitHub personal access token"
            />
          )}
        </div>
      </nav>

      <main className="gh-main">
        <div className="gh-container">
          {error && <div className="gh-error" role="alert">{error}</div>}

          {loading && !profile && (
            <div className="gh-loading">
              <span className="gh-loading-dot" /> Contacting api.github.com…
            </div>
          )}

          {profile && (
            <>
              {/* ---------- HERO ---------- */}
              <header className="gh-hero">
                <div className="gh-hero-grid">
                  <div className="gh-hero-text">
                    <span className="gh-hero-kicker">Developer Portfolio · Live from GitHub</span>
                    <h1 className="gh-hero-name">{profile.name || profile.login}</h1>
                    <div className="gh-hero-handle">
                      <a href={profile.html_url} target="_blank" rel="noreferrer">@{profile.login}</a>
                      {profile.location && <span>◆ {profile.location}</span>}
                      <span>◆ joined {new Date(profile.created_at).getFullYear()}</span>
                    </div>
                    {profile.bio && <p className="gh-hero-bio">{profile.bio}</p>}
                    <div className="gh-hero-chips">
                      <span className="gh-chip"><b>{fmt(profile.followers)}</b> followers</span>
                      <span className="gh-chip"><b>{fmt(profile.following)}</b> following</span>
                      <span className="gh-chip"><b>{fmt(profile.public_gists)}</b> gists</span>
                    </div>
                  </div>
                  <Tilt className="gh-avatar-wrap" max={12}>
                    <div className="gh-avatar-frame">
                      <img src={profile.avatar_url} alt={`${profile.login}'s avatar`} />
                    </div>
                    <span className="gh-avatar-stamp">● live data</span>
                  </Tilt>
                </div>
              </header>

              {/* ---------- MARQUEE ---------- */}
              <div className="gh-marquee" aria-hidden="true">
                <div className="gh-marquee-track">
                  {[...marqueeItems, ...marqueeItems].map((item, i) => (
                    <span className="gh-marquee-item" key={i}>{item}</span>
                  ))}
                </div>
              </div>

              {/* ---------- STATS ---------- */}
              <section className="gh-section">
                <div className="gh-section-head gh-reveal">
                  <h2 className="gh-section-title">By the numbers</h2>
                </div>
                <div className="gh-stats">
                  {[
                    ["Repositories", repos.length, `${stats.original} original · ${stats.forked} forked`, "brutal--violet"],
                    ["Stars earned", stats.stars, stats.topRepo ? `top: ${stats.topRepo.name}` : "—", ""],
                    ["Forks of your work", stats.forks, "across all repos", "brutal--cyan"],
                    ["Open issues", stats.openIssues, "awaiting attention", "brutal--pink"],
                    ["Gists", profile.public_gists, "public snippets", "brutal--violet"],
                  ].map(([label, value, sub, variant], i) => (
                    <div key={label} className={`gh-stat glass brutal ${variant}`}>
                      <span className="gh-stat-index">{String(i + 1).padStart(2, "0")}</span>
                      <div className="gh-stat-value mono" data-count={value ?? 0}>0</div>
                      <div className="gh-stat-label">{label}</div>
                      <div className="gh-stat-sub mono">{sub}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ---------- LANGUAGES ---------- */}
              {stats.langList.length > 0 && (
                <section className="gh-section">
                  <div className="gh-section-head gh-reveal">
                    <h2 className="gh-section-title">Language footprint</h2>
                    <span className="gh-label">weighted by repo size</span>
                  </div>
                  <div className="gh-langs glass gh-reveal">
                    <div className="gh-lang-bar">
                      {stats.langList.map((l) => (
                        <div
                          key={l.name}
                          className="gh-lang-seg"
                          title={`${l.name} ${l.pct.toFixed(1)}%`}
                          style={{ width: `${l.pct}%`, background: langColor(l.name) }}
                        />
                      ))}
                    </div>
                    <div className="gh-lang-legend">
                      {stats.langList.slice(0, 8).map((l) => (
                        <span key={l.name} className="gh-lang-item">
                          <span className="gh-lang-dot" style={{ background: langColor(l.name) }} />
                          {l.name}
                          <span>{l.pct.toFixed(1)}% · {l.count} repo{l.count === 1 ? "" : "s"}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ---------- PROJECTS ---------- */}
              <section className="gh-section">
                <div className="gh-section-head gh-reveal">
                  <h2 className="gh-section-title">Projects</h2>
                  <span className="gh-section-count">{shownRepos.length}</span>
                </div>
                <div className="gh-toolbar gh-reveal">
                  <input
                    className="gh-input"
                    style={{ width: 200 }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search projects"
                    aria-label="Search projects"
                  />
                  <select className="gh-select" value={langFilter} onChange={(e) => setLangFilter(e.target.value)} aria-label="Filter by language">
                    <option value="all">All languages</option>
                    {stats.langList.map((l) => <option key={l.name} value={l.name}>{l.name}</option>)}
                  </select>
                  <select className="gh-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort projects">
                    <option value="updated">Recently pushed</option>
                    <option value="stars">Most starred</option>
                    <option value="created">Newest</option>
                    <option value="name">A → Z</option>
                  </select>
                </div>

                {shownRepos.length === 0 ? (
                  <div className="gh-empty glass">No projects match. Clear the search or pick “All languages”.</div>
                ) : (
                  <div className="gh-repo-grid" ref={repoGridRef}>
                    {shownRepos.map((r) => (
                      <Tilt key={r.id} max={7} className="gh-repo-card glass">
                        <a href={r.html_url} target="_blank" rel="noreferrer" className="gh-repo-inner">
                          <span className="gh-repo-arrow">↗</span>
                          <div className="gh-repo-top">
                            <span className="gh-repo-name">{r.name}</span>
                            {r.fork && <span className="gh-tag gh-tag--fork">fork</span>}
                            {r.private && <span className="gh-tag gh-tag--private">private</span>}
                            {r.archived && <span className="gh-tag gh-tag--archived">archived</span>}
                          </div>
                          <p className="gh-repo-desc">
                            {r.description || <span className="none">No description yet.</span>}
                          </p>
                          <div className="gh-repo-meta">
                            {r.language && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <span className="gh-lang-dot" style={{ background: langColor(r.language) }} />
                                {r.language}
                              </span>
                            )}
                            <span>★ {fmt(r.stargazers_count)}</span>
                            <span>⑂ {fmt(r.forks_count)}</span>
                            <span className="pushed">pushed {timeAgo(r.pushed_at)}</span>
                          </div>
                        </a>
                      </Tilt>
                    ))}
                  </div>
                )}
              </section>

              {/* ---------- ACTIVITY ---------- */}
              {activity.length > 0 && (
                <section className="gh-section">
                  <div className="gh-section-head gh-reveal">
                    <h2 className="gh-section-title">Recent activity</h2>
                  </div>
                  <div className="gh-activity glass">
                    {activity.map((a, i) => (
                      <div key={i} className="gh-activity-row">
                        <span className="gh-activity-icon" style={{ color: a.color }}>{a.icon}</span>
                        <span className="gh-activity-label">{a.label}</span>
                        <span className="gh-activity-when">{timeAgo(a.when)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* ---------- FOOTER ---------- */}
        <footer className="gh-footer">
          <div className="gh-container gh-footer-inner">
            <span className="gh-logo">
              <span className="gh-logo-mark">⌥</span>
              DEV<span style={{ color: "var(--acid)" }}>/</span>FOLIO
            </span>
            <p className="gh-footer-note">
              Live data from api.github.com · without a token GitHub allows 60 requests/hour ·
              tokens stay in this page and are sent only to GitHub.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
