import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  AtSign,
  FileText
} from 'lucide-react';
import { SOHIT_AARYA_DATA } from '../../data/sohitPortfolioData';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const email = SOHIT_AARYA_DATA.email;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Email, Message).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    setLoading(true);

    // Persist inquiry locally in localStorage
    try {
      const raw = localStorage.getItem('mdn_contact_inquiries');
      const existing = raw ? JSON.parse(raw) : [];
      const newInquiry = {
        id: `inq_${Date.now()}`,
        ...formData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('mdn_contact_inquiries', JSON.stringify([newInquiry, ...existing.slice(0, 19)]));
    } catch {
      // ignore
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 600);
  };

  return (
    <section id="contact" className="relative py-28 bg-[#080808] border-t border-[#1a1a1a] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#FF2638]/6 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222222] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-[#FF2638] text-xs font-mono font-bold tracking-widest uppercase mb-3">
              <span>SECTION 08</span>
              <span className="text-neutral-600">/</span>
              <span>DIRECT INQUIRIES &amp; COLLABORATION</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              HAVE AN IDEA? <br />
              <span className="text-[#FF2638]">LET&apos;S BUILD SOMETHING.</span>
            </h2>
          </div>
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            DIRECT RESPONSE GUARANTEE
          </div>
        </div>

        {/* Contact Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Info Card & Email Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-[#111111] border border-[#242424] space-y-6 shadow-xl">
              <div>
                <span className="text-xs font-mono text-[#FF2638] uppercase tracking-widest font-bold">
                  DIRECT CONTACT:
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                  Start A Conversation
                </h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-medium">
                  Whether you have an idea for a new client-side tool, need a high-performance web platform built, or want to collaborate on technology projects, feel free to reach out.
                </p>
              </div>

              {/* Email Copy Card */}
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-2">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Official Email Address
                </div>
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={`mailto:${email}`}
                    className="text-xs sm:text-sm font-mono font-bold text-white hover:text-[#FF2638] transition-colors truncate"
                  >
                    {email}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-2 rounded-xl bg-[#222222] hover:bg-[#FF2638] text-neutral-300 hover:text-white transition-all shrink-0 cursor-pointer"
                    title="Copy Email Address"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && (
                  <div className="text-[10px] text-emerald-400 font-mono">
                    ✓ Email copied to clipboard!
                  </div>
                )}
              </div>

              {/* Guarantees */}
              <div className="space-y-3 pt-2 border-t border-[#1f1f1f] text-xs text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Confidential. Zero spam or shared emails.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#FF2638] shrink-0" />
                  <span>Direct reply within 24-48 business hours.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#111111] border border-[#242424] shadow-2xl space-y-6">
              {submitted ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. Sohit Aarya has received your inquiry and will follow up shortly at your email.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl bg-[#1a1a1a] hover:bg-[#242424] text-white text-xs font-bold uppercase transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-neutral-300 font-bold uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#FF2638]" />
                        <span>Your Name *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full p-3.5 bg-[#161616] border border-[#282828] focus:border-[#FF2638] rounded-xl text-white placeholder-neutral-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-bold uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                        <AtSign className="w-3.5 h-3.5 text-[#FF2638]" />
                        <span>Email Address *</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full p-3.5 bg-[#161616] border border-[#282828] focus:border-[#FF2638] rounded-xl text-white placeholder-neutral-500 focus:outline-none transition-colors font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-bold uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#FF2638]" />
                      <span>Subject or Project Type</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Website Development / Tool Idea / Partnership"
                      className="w-full p-3.5 bg-[#161616] border border-[#282828] focus:border-[#FF2638] rounded-xl text-white placeholder-neutral-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-bold uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#FF2638]" />
                      <span>Message / Project Details *</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your project, timeline, or requirements..."
                      className="w-full p-3.5 bg-[#161616] border border-[#282828] focus:border-[#FF2638] rounded-xl text-white placeholder-neutral-500 focus:outline-none transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#FF2638] via-[#e61729] to-[#b30012] hover:from-[#ff3d4e] hover:to-[#cc0016] shadow-xl shadow-[#FF2638]/30 hover:shadow-[#FF2638]/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span>Dispatching Message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>SUBMIT INQUIRY TO SOHIT AARYA</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
