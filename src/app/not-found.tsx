export default function NotFound() {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", padding: "4rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 700 }}>404</h1>
        <p style={{ color: "#78716c" }}>Page not found.</p>
        <a href="/" style={{ color: "#111", textDecoration: "underline" }}>Go home</a>
      </body>
    </html>
  );
}
