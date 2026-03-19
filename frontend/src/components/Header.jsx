// "use client";

// export default function Header() {
//   return (
//     <div className="absolute top-0 left-0 w-full h-14 bg-blue-900 text-white flex items-center justify-between px-4 z-[100] shadow-md">
      
//       {/* App Logo + Name */}
//       <div className="flex items-center gap-2">
//         <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-lg">
//           👩
//         </div>
//         <h1 className="text-lg font-semibold">Women’s Safety</h1>
//       </div>

//       {/* Notification Icon */}
//       <div className="text-xl cursor-pointer">🔔</div>

//     </div>
//   );
// }


"use client";

export default function Header() {
  return (
    <div
      className="w-full h-14 bg-blue-900 text-white flex items-center justify-between px-4 shadow-md"
      style={{ position: "relative", zIndex: 999 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-lg">
          👩
        </div>
        <h1 className="text-lg font-semibold">Women's Safety</h1>
      </div>
      <div className="text-xl cursor-pointer">🔔</div>
    </div>
  );
}