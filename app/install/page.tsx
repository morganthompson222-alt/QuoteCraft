import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Install JobStacker — Desktop & Mobile",
  description:
    "Install JobStacker on your Mac, Windows, iPhone, or Android device. Access your quote and job management workspace as a native app in seconds.",
  alternates: { canonical: "https://jobstacker.app/install" },
};

export default function InstallPage() {
  return (
    <section className="page">
      <div className="page__inner" style={{ maxWidth: 780, margin: "0 auto" }}>
        <p className="hero__eyebrow" style={{ marginBottom: 8 }}>Get the App</p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>
          Install JobStacker on your device
        </h1>
        <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, marginBottom: 40 }}>
          JobStacker works everywhere — in your browser, on your desktop, and on your phone.
          No downloads, no updates. Install once and access it like any other app.
        </p>

        {/* Chrome / Edge */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "28px 32px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eefaf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1F6B4F" }}>1</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }} id="mac">Mac — Add to Dock</h2>
          </div>
          <ol style={{ paddingLeft: 20, color: "#334155", fontSize: 15, lineHeight: 2 }}>
            <li>Open <strong style={{ color: "#1F6B4F" }}>JobStacker</strong> in Safari on your Mac</li>
            <li>Go to <strong>File → Add to Dock…</strong> (or click Share → Add to Dock)</li>
            <li>Name it <strong>JobStacker</strong> and click Add — it appears in your Dock like a native app</li>
          </ol>
        </div>

        {/* Safari / Mac */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "28px 32px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eefaf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1F6B4F" }}>2</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }} id="windows">Windows — Install from Browser</h2>
          </div>
          <ol style={{ paddingLeft: 20, color: "#334155", fontSize: 15, lineHeight: 2 }}>
            <li>Open <strong style={{ color: "#1F6B4F" }}>JobStacker</strong> in Chrome or Edge on Windows</li>
            <li>Click the <strong>install icon</strong> in the address bar → &quot;Install JobStacker&quot;</li>
            <li>JobStacker opens in its own window — find it in your Start Menu like any app</li>
          </ol>
        </div>

        {/* iPhone / iPad */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "28px 32px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eefaf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1F6B4F" }}>3</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>iPhone & iPad</h2>
          </div>
          <ol style={{ paddingLeft: 20, color: "#334155", fontSize: 15, lineHeight: 2 }}>
            <li>Open <strong style={{ color: "#1F6B4F" }}>JobStacker</strong> in Safari on your iPhone or iPad</li>
            <li>Tap the <strong>Share</strong> button at the bottom of the screen</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
            <li>Tap <strong>Add</strong> — it appears as an app icon on your home screen</li>
          </ol>
        </div>

        {/* Android */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "28px 32px", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eefaf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1F6B4F" }}>4</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Android (Chrome)</h2>
          </div>
          <ol style={{ paddingLeft: 20, color: "#334155", fontSize: 15, lineHeight: 2 }}>
            <li>Open <strong style={{ color: "#1F6B4F" }}>JobStacker</strong> in Chrome on your Android device</li>
            <li>Tap the <strong>three dots</strong> menu in the top right</li>
            <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
            <li>JobStacker installs like any app — find it in your app drawer</li>
          </ol>
        </div>

        <div style={{ background: "#f8fafc", borderRadius: 12, border: "1px solid #e5e7eb", padding: "24px 32px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Once installed, JobStacker works like any native app — full-screen, offline-capable, and always up to date.
          </p>
          <div style={{ marginTop: 16 }}>
            <Link href="/signup" style={{ padding: "12px 32px", background: "#1F6B4F", color: "#fff", borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
              Start stacking &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
