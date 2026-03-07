import { useState, useEffect, useRef } from "react";
import {
  FiTruck, FiMapPin, FiFileText, FiMic,
  FiShield, FiCheckCircle, FiMenu, FiX,
  FiUsers, FiZap, FiBell, FiArrowRight
} from "react-icons/fi";
import { RiWhatsappLine } from "react-icons/ri";
import { MdOutlineRoute } from "react-icons/md";

/* ───── Scroll reveal hook ───── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ═══════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════ */
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = ["Features", "How it works", "Pricing"];
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-trukio-sand/95 backdrop-blur-sm border-b border-trukio-tan shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-trukio-teal rounded-lg flex items-center justify-center">
            <FiTruck className="text-white" size={15} />
          </div>
          <span className="font-heading font-black text-xl tracking-tight text-trukio-charcoal">Trukio</span>
        </div>
        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="font-body text-sm text-trukio-warmgray hover:text-trukio-charcoal transition-colors font-medium">{l}</a>
          ))}
        </div>
        {/* Desktop CTA */}
        <div className="hidden md:block">
          <a href="#early-access"
            className="font-body text-sm font-semibold px-5 py-2.5 bg-trukio-teal text-white rounded-lg hover:bg-trukio-teal-dark transition-colors">Get Early Access</a>
        </div>
        {/* Mobile menu toggle */}
        <button className="md:hidden text-trukio-charcoal" onClick={() => setOpen(!open)}>
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-trukio-sand border-t border-trukio-tan px-6 py-5 flex flex-col gap-4">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} onClick={() => setOpen(false)}
              className="font-body text-sm text-trukio-warmgray font-medium">{l}</a>
          ))}
          <a href="#early-access" onClick={() => setOpen(false)}
            className="font-body text-sm font-semibold px-4 py-2.5 bg-trukio-teal text-white rounded-lg text-center mt-1">Get Early Access</a>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════ */
function Hero() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      await fetch(`https://script.google.com/macros/s/AKfycbzXhhNHDY_EaLWzDeO_U76A937h5Ubl527X5Z2LyhN-0w-Ifx2U1hbA4Ff7kulI-3yC/exec?email=${encodeURIComponent(email)}`, { method: "GET", mode: "no-cors" });
      setStatus("success");
      setEmail("");
    } catch { setStatus("error"); }
  };
  return (
    <section className="min-h-screen flex flex-col justify-center pt-24 pb-20 px-6 bg-trukio-sand relative overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle, #8A8279 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      {/* Gradient blobs */}
      <div className="absolute top-1/4 right-[-8rem] w-[32rem] h-[32rem] bg-trukio-sage rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-[-6rem] w-[24rem] h-[24rem] bg-trukio-beige rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-trukio-sage border border-trukio-sage-mid rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-trukio-teal animate-pulse" />
            <span className="font-body text-xs font-bold text-trukio-teal uppercase tracking-widest">Now in Early Access</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-5xl md:text-[4.5rem] lg:text-[5.5rem] font-black text-trukio-charcoal leading-[1.04] tracking-tight mb-6">
            Run your fleet.<br /><span className="text-trukio-teal">Not your WhatsApp.</span>
          </h1>

          {/* Subheadline */}
          <p className="font-body text-lg md:text-xl text-trukio-warmgray leading-relaxed max-w-lg mb-10">
            Trukio is the operations cockpit for small Indian freight operators. Voice orders, live GPS tracking, and instant invoices — replacing notebooks and group chats for good.
          </p>

          {/* Email form */}
          <div id="early-access" className="flex flex-col sm:flex-row gap-3 max-w-md mb-4">
            <input type="email" placeholder="Enter your email" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
              className="font-body flex-1 px-4 py-3.5 rounded-xl border border-trukio-tan bg-trukio-white text-trukio-charcoal text-sm placeholder-trukio-muted focus:outline-none focus:ring-2 focus:ring-trukio-teal focus:border-transparent shadow-sm" />
            <button onClick={handleSubmit} disabled={status === "loading" || status === "success"}
              className="font-body px-6 py-3.5 bg-trukio-teal text-white text-sm font-semibold rounded-xl hover:bg-trukio-teal-dark active:scale-95 transition-all disabled:opacity-60 whitespace-nowrap flex items-center justify-center gap-2 shadow-sm">
              {status === "success" ? <><FiCheckCircle size={15} /> You&apos;re in!</> : status === "loading" ? "Joining..." : <>Get Early Access <FiArrowRight size={14} /></>}
            </button>
          </div>
          {status === "error" && <p className="font-body text-sm text-trukio-danger mb-4">Something went wrong. Please try again.</p>}
          <p className="font-body text-xs text-trukio-muted flex items-center gap-1.5"><FiShield size={12} /> No spam, ever. Unsubscribe any time.</p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PROBLEM
   ═══════════════════════════════════════════ */
function Problem() {
  const [ref, visible] = useReveal();
  const pains = [
    { icon: <RiWhatsappLine size={20} />, text: "Orders lost in WhatsApp groups" },
    { icon: <FiFileText size={20} />, text: "Invoices written by hand in booklets" },
    { icon: <FiMapPin size={20} />, text: "No idea where your trucks are" },
    { icon: <FiUsers size={20} />, text: "Drivers calling you for every update" },
  ];
  return (
    <section className="py-24 px-6 bg-trukio-white border-t border-trukio-tan">
      <div ref={ref} className={`max-w-6xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-body text-xs font-bold text-trukio-teal uppercase tracking-widest mb-4">The problem</p>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-trukio-charcoal leading-tight mb-6">This is how most operators run today.</h2>
            <p className="font-body text-trukio-warmgray text-lg leading-relaxed">If you have 5–50 trucks and you&apos;re managing everything through calls, WhatsApp messages, and paper booklets — you&apos;re not alone. But there&apos;s a better way.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {pains.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-trukio-tan bg-trukio-sand">
                <div className="w-10 h-10 rounded-lg bg-trukio-danger-light border border-trukio-danger-border text-trukio-danger flex items-center justify-center flex-shrink-0">{p.icon}</div>
                <p className="font-body text-trukio-charcoal font-medium text-sm">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════ */
function Features() {
  const [ref, visible] = useReveal();
  const features = [
    { icon: <FiMic size={22} />, title: "Voice Order Entry", desc: "Speak an order in Hindi, Marathi, or English. Trukio understands and creates a structured job instantly — no typing needed.", bg: "bg-trukio-violet-bg", bd: "border-trukio-violet-border", tx: "text-trukio-violet" },
    { icon: <FiMapPin size={22} />, title: "Live GPS Tracking", desc: "See every truck on a live map. Drivers share location automatically during active jobs. Know where your fleet is, always.", bg: "bg-trukio-sage", bd: "border-trukio-sage-mid", tx: "text-trukio-teal" },
    { icon: <FiFileText size={22} />, title: "Instant Invoices", desc: "One tap generates a professional PDF invoice the moment a job is delivered. Share directly to WhatsApp or print.", bg: "bg-trukio-blue-bg", bd: "border-trukio-blue-border", tx: "text-trukio-blue" },
    { icon: <FiUsers size={22} />, title: "Driver Management", desc: "Invite drivers via WhatsApp link. Manage permanent staff and one-day hires. Assign jobs and track acceptance in real time.", bg: "bg-trukio-amber-bg", bd: "border-trukio-amber-border", tx: "text-trukio-amber" },
    { icon: <FiZap size={22} />, title: "Works Offline", desc: "Bad network on the highway? No problem. Orders, jobs, and updates sync automatically when connectivity returns.", bg: "bg-trukio-orange-bg", bd: "border-trukio-orange-border", tx: "text-trukio-orange" },
    { icon: <FiBell size={22} />, title: "Smart Notifications", desc: "Get notified the moment a driver accepts, picks up, or delivers. No more follow-up calls. You stay in the loop automatically.", bg: "bg-trukio-pink-bg", bd: "border-trukio-pink-border", tx: "text-trukio-pink" },
  ];
  return (
    <section id="features" className="py-24 px-6 bg-trukio-sand border-t border-trukio-tan">
      <div ref={ref} className={`max-w-6xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="font-body text-xs font-bold text-trukio-teal uppercase tracking-widest mb-4">Features</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-trukio-charcoal leading-tight">Everything your operation needs.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 bg-trukio-white rounded-2xl border border-trukio-tan hover:shadow-md transition-all duration-300 group cursor-default">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${f.bg} ${f.bd} ${f.tx}`}>{f.icon}</div>
              <h3 className="font-heading font-bold text-trukio-charcoal text-base mb-2">{f.title}</h3>
              <p className="font-body text-trukio-warmgray text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════ */
function HowItWorks() {
  const [ref, visible] = useReveal();
  const steps = [
    { num: "01", icon: <FiMic size={24} />, title: "Create an order", desc: "Speak, type, or fill a form. Trukio captures every detail — pickup, drop, material, quantity, customer — and stores it instantly." },
    { num: "02", icon: <FiTruck size={24} />, title: "Assign to a driver", desc: "Pick a driver from your team. They get a notification on their phone, accept the job, and the order moves to in-progress." },
    { num: "03", icon: <MdOutlineRoute size={24} />, title: "Track & deliver", desc: "Watch the truck on your live map. Driver marks pickup and delivery. You get notified at every step — automatically." },
    { num: "04", icon: <FiFileText size={24} />, title: "Invoice in one tap", desc: "Job delivered? Tap to generate a GST-ready PDF invoice. Share it to WhatsApp or email in seconds. No booklet needed." },
  ];
  return (
    <section id="how-it-works" className="py-24 px-6 bg-trukio-white border-t border-trukio-tan">
      <div ref={ref} className={`max-w-6xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="font-body text-xs font-bold text-trukio-teal uppercase tracking-widest mb-4">How it works</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-trukio-charcoal leading-tight">From order to invoice in minutes.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-trukio-teal text-white flex items-center justify-center flex-shrink-0">{s.icon}</div>
                <span className="font-heading text-2xl font-black text-trukio-tan">{s.num}</span>
              </div>
              <h3 className="font-heading font-bold text-trukio-charcoal text-base mb-2">{s.title}</h3>
              <p className="font-body text-trukio-warmgray text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════ */
function Pricing() {
  const [ref, visible] = useReveal();
  const plans = [
    { name: "Starter", price: "₹299", period: "/month", desc: "Perfect for small operators just getting started.", seats: "Up to 5 drivers", features: ["Unlimited orders", "Live GPS tracking", "PDF invoices", "WhatsApp sharing", "Offline mode", "6 custom materials"], highlight: false },
    { name: "Growth", price: "₹599", period: "/month", desc: "For growing operations with a larger fleet.", seats: "Up to 20 drivers", features: ["Everything in Starter", "Voice & chat order entry", "30 custom materials", "Priority support", "Drive backup"], highlight: true },
    { name: "Fleet", price: "₹999", period: "/month", desc: "For established operators managing large fleets.", seats: "Up to 50 drivers", features: ["Everything in Growth", "Custom invoice branding", "Remove Trukio watermark", "Dedicated onboarding", "Analytics dashboard", "Unlimited custom materials"], highlight: false },
  ];
  return (
    <section id="pricing" className="py-24 px-6 bg-trukio-sand border-t border-trukio-tan">
      <div ref={ref} className={`max-w-6xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="font-body text-xs font-bold text-trukio-teal uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-trukio-charcoal leading-tight mb-4">Simple, honest pricing.</h2>
          <p className="font-body text-trukio-warmgray text-base">Drivers are always free. You only pay for the owner account.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => (
            <div key={i}
              className={`rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                p.highlight
                  ? "bg-trukio-teal border-trukio-teal-dark shadow-xl scale-105"
                  : "bg-trukio-white border-trukio-tan hover:shadow-md"
              }`}
              style={p.highlight ? { boxShadow: "0 8px 32px rgba(26,107,90,0.18)" } : {}}
            >
              {p.highlight && (
                <div className="inline-flex self-start mb-4">
                  <span className="font-body text-xs font-bold bg-trukio-teal-dark text-trukio-sage px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                </div>
              )}
              <h3 className={`font-heading font-black text-xl mb-1 ${p.highlight ? "text-white" : "text-trukio-charcoal"}`}>{p.name}</h3>
              <p className={`font-body text-sm mb-4 ${p.highlight ? "text-trukio-sage-mid" : "text-trukio-muted"}`}>{p.desc}</p>
              <div className="flex items-end gap-1 mb-2">
                <span className={`font-heading text-4xl font-black ${p.highlight ? "text-white" : "text-trukio-charcoal"}`}>{p.price}</span>
                <span className={`font-body text-sm mb-1 ${p.highlight ? "text-trukio-sage-mid" : "text-trukio-muted"}`}>{p.period}</span>
              </div>
              <p className={`font-body text-xs font-semibold mb-6 ${p.highlight ? "text-trukio-sage-mid" : "text-trukio-muted"}`}>{p.seats}</p>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <FiCheckCircle size={15} className={`mt-0.5 flex-shrink-0 ${p.highlight ? "text-trukio-sage-mid" : "text-trukio-teal"}`} />
                    <span className={`font-body text-sm ${p.highlight ? "text-trukio-sage" : "text-trukio-warmgray"}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#early-access"
                className={`font-body text-sm font-semibold px-6 py-3 rounded-xl text-center transition-all active:scale-95 ${
                  p.highlight
                    ? "bg-trukio-white text-trukio-teal hover:bg-trukio-sage"
                    : "bg-trukio-teal text-white hover:bg-trukio-teal-dark"
                }`}>Get Early Access</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CTA BANNER
   ═══════════════════════════════════════════ */
function CTABanner() {
  const [ref, visible] = useReveal();
  return (
    <section className="py-24 px-6 bg-trukio-dark">
      <div ref={ref} className={`max-w-3xl mx-auto text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className="font-heading text-4xl md:text-5xl font-black text-white leading-tight mb-4">Stop managing your business on WhatsApp.</h2>
        <p className="font-body text-trukio-warmgray text-lg mb-10 max-w-xl mx-auto">Join the early access list. Be the first operator in your city to run a digitised fleet.</p>
        <a href="#early-access"
          className="font-body inline-flex items-center gap-2 px-8 py-4 bg-trukio-teal text-white font-semibold rounded-xl hover:bg-trukio-teal-dark transition-colors text-base">
          Get Early Access <FiArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="py-10 px-6 bg-trukio-dark border-t border-trukio-dark-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-trukio-teal rounded-lg flex items-center justify-center">
            <FiTruck className="text-white" size={13} />
          </div>
          <span className="font-heading font-black text-lg text-white">Trukio</span>
        </div>
        <p className="font-body text-trukio-warmgray text-sm text-center">
          Built for Indian freight operators. &copy; {new Date().getFullYear()} Trukio. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" className="font-body text-trukio-warmgray hover:text-trukio-muted text-sm transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-trukio-sand">
      <Nav />
      <Hero />
      <Problem />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTABanner />
      <Footer />
    </div>
  );
}
