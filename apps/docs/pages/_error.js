// Pages Router _error fallback stub.
//
// Sabab: Next.js 15.5.x + React 19 kombinatsiyasida App Router'da
// `/_not-found` va `/_error` sahifalarini SSG prerender qilganda legacy
// pages-router fallback ishga tushadi va `<Html>` import xatosini beradi.
//
// Bu stub null qaytaradi — `<Html>` chaqirilmaydi, prerender yashil bo'ladi.
// App Router `app/not-found.tsx` (agar bo'lsa) runtime'da ishlaydi.
//
// ADR: docs/adr/0004-next15-react19-nextauth-prerender.md
function Error() {
  return null;
}

Error.getInitialProps = function ({ res, err }) {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
