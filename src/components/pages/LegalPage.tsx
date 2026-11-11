import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  if (type === 'privacy') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Privacy & Data Policy
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Privacy Policy & Data Deletion Guarantee
          </h1>
          <p className="text-xs text-slate-400">Last updated: November 2026</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Zero Server Upload Architecture</h2>
            <p>
              MultipleDarkNews Tools is engineered with client-side sandbox isolation. When you compress a PDF, convert an image, format JSON, or calculate loan EMIs, all processing occurs directly within your device's browser memory (WebAssembly & HTML5 Canvas).
            </p>
            <p>
              Your documents, images, and confidential files are never transmitted to, stored on, or analyzed by any remote server or third-party database.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. No AI Training or Content Mining</h2>
            <p>
              We firmly reject the practice of mining user documents for artificial intelligence training. Because your files never reach our servers, it is technically impossible for your content to be used to train AI models.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Automatic Memory Revocation</h2>
            <p>
              Temporary object URLs created during file generation are automatically revoked immediately upon downloading or within 15 minutes of session inactivity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">4. Contact & Compliance</h2>
            <p>
              For security inquiries or questions regarding MultipleDarkNews Tools, contact us via the official parent portal at <a href="https://multipledarknews.com" className="text-rose-400 underline">multipledarknews.com</a>.
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" /> Terms of Service
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400">Last updated: November 2026</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Acceptance of Terms</h2>
          <p>
            By accessing MultipleDarkNews Tools, you agree to comply with and be bound by these terms. The platform is provided free of charge for worldwide users without subscription fees.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Permitted Use</h2>
          <p>
            You are free to use our tools for personal, educational, and commercial purposes. You agree not to attempt to attack, overload, or reverse-engineer the underlying service infrastructure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Disclaimer of Warranty</h2>
          <p>
            While we strive for high precision, file processing is provided "as is". MultipleDarkNews is not liable for data corruption resulting from pre-existing file damage. Always maintain backups of critical documents.
          </p>
        </section>
      </div>
    </div>
  );
};
