import Link from "next/link";

export default function NotFound() {
  return (
    <section className="sec">
      <div className="shell-narrow" style={{ textAlign: "center" }}>
        <p className="ptitle" style={{ fontSize: "clamp(80px,16vw,160px)", lineHeight: 0.95 }}>
          404
        </p>
        <h1 className="h2" style={{ marginTop: 8 }}>
          This page took a different upgrade path.
        </h1>
        <p className="psub" style={{ margin: "16px auto 0" }}>
          The link you followed is broken or the page has moved. But there&apos;s a whole store of
          certified phones waiting — let&apos;s get you back on track.
        </p>
        <div
          className="hlinks"
          style={{ marginTop: 30, justifyContent: "center", alignItems: "center" }}
        >
          <Link className="btn" href="/">
            Back to home
          </Link>
          <Link className="link" href="/shop">
            Browse all phones <span className="chev">&rsaquo;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
