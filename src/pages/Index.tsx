import { Link } from "react-router-dom";
import { Logo } from "@/components/medical/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImg from "@/assets/medical-hero.jpg";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  FlaskConical,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

const roles = [
  { title: "Doctors", description: "AI-assisted consultations, records and patient messaging.", icon: Stethoscope },
  { title: "Patients", description: "Vitals, appointments, bills, prescriptions and care chat.", icon: HeartPulse },
  { title: "Nurses", description: "Medication schedules, emergency alerts and room assignments.", icon: UserRound },
  { title: "Labs", description: "Assigned tests, uploads and recent report tracking.", icon: FlaskConical },
];

const highlights = ["OTP-first demo login", "Live human verification", "Unified clinical workflows", "Responsive care dashboards"];

const Index = () => {
  return (
    <div className="min-h-screen overflow-hidden hero-bg">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo size="lg" />
        <div className="hidden items-center gap-3 sm:flex">
          <Badge variant="secondary" className="rounded-full gap-1.5 px-3 py-1">
            <ShieldCheck size={14} className="text-primary" /> Secure healthcare demo
          </Badge>
          <Button asChild className="rounded-full bg-gradient-primary shadow-glow">
            <Link to="/login">Launch app</Link>
          </Button>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 pb-16 pt-8 lg:pt-14">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-slide-up">
            <Badge className="rounded-full bg-primary-soft text-primary hover:bg-primary-soft">
              <Bot size={14} className="mr-1" /> AI-powered hospital operating system
            </Badge>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-tight text-foreground sm:text-6xl lg:text-7xl">
              Smarter care for every role in the hospital.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              CuraSense connects doctors, patients, nurses and laboratories in one polished portal with secure onboarding,
              actionable dashboards and AI-assisted healthcare workflows.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-2xl bg-gradient-primary px-7 text-base shadow-glow">
                <Link to="/login">
                  Get started <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl bg-background/70 px-7 text-base backdrop-blur">
                <Link to="/patient-dashboard">Preview patient dashboard</Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CheckCircle2 size={17} className="text-primary" /> {item}
                </div>
              ))}
            </div>
          </div>

          <div className="animate-slide-up lg:pl-4" style={{ animationDelay: "90ms" }}>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-3 shadow-large backdrop-blur-xl">
              <img src={heroImg} alt="Modern healthcare professionals using CuraSense" className="h-[430px] w-full rounded-[1.5rem] object-cover" />
              <div className="absolute inset-x-8 bottom-8 rounded-3xl border border-white/50 bg-background/90 p-5 shadow-large backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Today</p>
                    <h2 className="mt-1 font-display text-2xl font-bold">186 patients served</h2>
                  </div>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
                    <Activity className="text-primary-foreground" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <Metric label="AI cases" value="42" />
                  <Metric label="Reports" value="18" />
                  <Metric label="Alerts" value="3" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, index) => (
            <article key={role.title} className="card-medical p-6 animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft">
                <role.icon size={22} className="text-primary" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{role.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{role.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-primary-soft px-3 py-2">
    <div className="font-display text-lg font-bold text-primary">{value}</div>
    <div className="text-muted-foreground">{label}</div>
  </div>
);

export default Index;
