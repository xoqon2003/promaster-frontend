// Pages Router'ning default `_error` sahifasini override qilish uchun stub.
// Next.js 15 + App Router'da `<Html>` bug'iga qarshi ishlatilgan
// (see: https://github.com/vercel/next.js/issues/56481)
// Haqiqiy 404/error sahifalari `app/not-found.tsx` va `app/error.tsx` ichida.

function Error() {
  return null;
}

Error.getInitialProps = function ({ res, err }) {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
