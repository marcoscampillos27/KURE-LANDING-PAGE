import { useEffect, useMemo, useState } from 'react';
import { looksLikeEmail, isDisposable } from '../lib/validators';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [downloadReady, setDownloadReady] = useState(false);

  const tests = useMemo(() => ([
    { email: 'user@example.com', valid: true, disposable: false },
    { email: 'bad@', valid: false, disposable: false },
    { email: 'temp@10minutemail.com', valid: true, disposable: true },
  ].map(c => ({ ...c,
    gotValid: looksLikeEmail(c.email),
    gotDisposable: isDisposable(c.email),
    pass: looksLikeEmail(c.email) === c.valid && isDisposable(c.email) === c.disposable,
  }))), []);

  useEffect(() => { if (!msg && !err) return; const t = setTimeout(() => { setMsg(null); setErr(null); }, 8000); return () => clearTimeout(t); }, [msg, err]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setErr(null); setDownloadReady(false);
    const eTrim = email.trim();
    if (!looksLikeEmail(eTrim)) { setErr('Email no válido'); return; }
    if (isDisposable(eTrim)) { setErr('No aceptamos correos temporales'); return; }
    setLoading(true);
    try {
      const url = new URL(window.location.href);
      const utm = {
        source: url.searchParams.get('utm_source'),
        medium: url.searchParams.get('utm_medium'),
        campaign: url.searchParams.get('utm_campaign'),
        term: url.searchParams.get('utm_term'),
        content: url.searchParams.get('utm_content'),
      };
      const payload = { email: eTrim, utm, referrer: document.referrer || null, ua: navigator.userAgent };
      const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const data = await res.json().catch(()=>({})); throw new Error(data?.error || 'Error'); }
      setMsg('Descarga lista. Hemos guardado tu email.'); setDownloadReady(true); setEmail('');
    } catch (e: any) {
      setErr(e?.message || 'Ha ocurrido un error');
    } finally { setLoading(false); }
  }

  function handleDownload() {
    window.location.href = '/guia-kure.pdf';
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900">
      <header className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <span className="text-xl font-semibold">Kure</span>
        <a href="#form" className="rounded-xl bg-blue-600 px-4 py-2 text-white">Consigue la guía</a>
      </header>
      <section id="form" className="mx-auto max-w-3xl px-6 pb-20">
        <div className="rounded-2xl border p-6 bg-white">
          <h2 className="text-2xl font-bold">Recibe la guía gratuita</h2>
          <p className="mt-2 text-gray-600">Descarga inmediata (guardamos tu email).</p>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
            <input type="email" required placeholder="tu@email.com" className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-300 outline-none" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <button disabled={loading} className="rounded-xl bg-blue-600 px-6 py-3 text-white disabled:opacity-60">{loading? 'Procesando…':'Obtener guía'}</button>
          </form>
          {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
          {msg && <p className="mt-4 text-sm text-blue-700">{msg}</p>}
          {downloadReady && (<div className="mt-6 border p-4 bg-emerald-50 rounded-xl">
            <p className="font-medium">Tu guía está lista ✅</p>
            <button onClick={handleDownload} className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-white">Descargar Guía</button>
          </div>)}
        </div>
      </section>
      <section id="tests" className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-2xl border p-6 bg-white">
          <h3 className="text-xl font-semibold">Tests automáticos</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Esperado válido</th><th className="py-2 pr-4">Esperado desechable</th><th className="py-2 pr-4">Resultado</th></tr></thead><tbody>
              {tests.map((r,i)=> (
                <tr key={i} className="border-b last:border-0"><td className="py-2 pr-4 font-mono">{r.email}</td><td className="py-2 pr-4">{String(r.valid)}</td><td className="py-2 pr-4">{String(r.disposable)}</td><td className={`py-2 pr-4 font-medium ${r.pass? 'text-emerald-700':'text-red-700'}`}>{r.pass? 'PASS':'FAIL'}</td></tr>
              ))}
            </tbody></table>
          </div>
        </div>
      </section>
    </main>
  );
}
