"use client";

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md z-[200]">
      <div className="flex justify-around items-center h-16 text-sm text-gray-500">

        <NavItem label="Safety" icon="🛡️" />
        <NavItem label="Map" icon="🗺️" active />
        <NavItem label="Alerts" icon="🔔" />
        <NavItem label="Profile" icon="👤" />

      </div>
    </div>
  );
}

function NavItem({ label, icon, active }) {
  return (
    <div
      className={`flex flex-col items-center ${
        active ? "text-blue-600 font-semibold" : ""
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
