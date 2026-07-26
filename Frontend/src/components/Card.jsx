import { Users } from "lucide-react";

/** Legacy wrapper — prefer StatCard for new pages */
function Card({ title, value, color = "bg-gradient-to-br from-indigo-500 to-cyan-400" }) {
  return (
    <div className={`rounded-3xl p-5 text-white shadow-lg ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/80">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <Users size={22} className="opacity-80" />
      </div>
    </div>
  );
}

export default Card;
