import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/medical/AppHeader";
import { FilePlus2, FileClock, Receipt, FlaskConical, MessageSquare, Activity, Users, TrendingUp, Calendar } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const doc = JSON.parse(localStorage.getItem("doctorDetails") || "{}");

  // ✅ FIXED HERE
  const hospital = doc.hospital || "CuraSense Hospital";
  const name = doc.name || "Doctor";

  // Random cute avatar using DiceBear API
  const avatarSeed = localStorage.getItem("doctorAvatarSeed") || name;
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  const actions = [
    { title: "New Consultation", desc: "Start AI screening", icon: FilePlus2, color: "from-emerald-500 to-teal-500", route: "/new-data" },
    { title: "Previous Reports", desc: "View history", icon: FileClock, color: "from-cyan-500 to-blue-500", route: "/previous-data" },
    { title: "Bills", desc: "Manage billing", icon: Receipt, color: "from-amber-500 to-orange-500", route: "#" },
    { title: "Laboratory", desc: "Test orders", icon: FlaskConical, color: "from-violet-500 to-purple-500", route: "/lab" },
    { title: "Messages", desc: "Patient chats", icon: MessageSquare, color: "from-green-500 to-emerald-500", route: "/doctor-messages" },
  ];

  const stats = [
    { label: "Today's Patients", value: "24", icon: Users, trend: "+12%" },
    { label: "Active Reports", value: "8", icon: Activity, trend: "+3" },
    { label: "This Month", value: "186", icon: TrendingUp, trend: "+24%" },
    { label: "Appointments", value: "6", icon: Calendar, trend: "Today" },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* ✅ HEADER AUTO UPDATED */}
      <AppHeader userName={name} hospital={hospital} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <section className="rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-8 text-primary-foreground shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 animate-slide-up">
          <div className="h-20 w-20 rounded-2xl ring-4 ring-white/30 shrink-0 bg-white/20 flex items-center justify-center overflow-hidden">
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-sm opacity-80">Welcome back,</p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-1">
              Dr. {name.replace(/^Dr\.?\s*/i, "")} <span className="opacity-90">👋</span>
            </h1>
            <p className="mt-1 text-sm opacity-90">
              Here's what's happening at your clinic today.
            </p>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <div key={s.label} className="card-medical p-5 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center">
                  <s.icon size={18} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary bg-primary-soft rounded-full px-2 py-0.5">
                  {s.trend}
                </span>
              </div>
              <div className="mt-3 font-display text-3xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <h2 className="font-display text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {actions.map((a, i) => (
            <button
              key={a.title}
              onClick={() => a.route !== "#" && navigate(a.route)}
              className="card-medical p-6 text-left group animate-slide-up"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-medium group-hover:scale-110 transition-transform`}>
                <a.icon size={24} className="text-white" strokeWidth={2.2} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{a.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
              <div className="mt-4 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Open →
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;