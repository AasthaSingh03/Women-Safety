// // "use client";

// // export default function Legend() {
// //   return (
// //     // <div className="absolute bottom-32 left-4 bg-white rounded-lg shadow-lg p-3 z-[100] w-36">
// //       <div className="fixed bottom-[20vh] left-[4vw] bg-white rounded-lg shadow-lg p-3 z-[100] w-36">
// //       <h3 className="text-sm font-semibold mb-2">Legend</h3>

// //       <div className="flex items-center gap-2 mb-1">
// //         <span className="w-3 h-3 rounded-full bg-red-500"></span>
// //         <span className="text-xs">High Risk</span>
// //       </div>

// //       <div className="flex items-center gap-2 mb-1">
// //         <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
// //         <span className="text-xs">Moderate</span>
// //       </div>

// //       <div className="flex items-center gap-2">
// //         <span className="w-3 h-3 rounded-full bg-green-500"></span>
// //         <span className="text-xs">Safe</span>
// //       </div>
// //     </div>
// //   );
// // }


// "use client";

// export default function Legend() {
//   return (
//     <div
//       className="
//         fixed
//         top-1/2
//         left-3
//         -translate-y-1/2
//         bg-white
//         rounded-xl
//         shadow-lg
//         p-4
//         z-[120]
//         w-40
//         text-sm
//       "
//     >
//       <h4 className="font-semibold mb-2">Legend</h4>

//       <div className="flex items-center gap-2 mb-1">
//         <span className="w-3 h-3 rounded-full bg-red-500"></span>
//         <span>High Risk</span>
//       </div>

//       <div className="flex items-center gap-2 mb-1">
//         <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
//         <span>Moderate</span>
//       </div>

//       <div className="flex items-center gap-2">
//         <span className="w-3 h-3 rounded-full bg-green-500"></span>
//         <span>Safe</span>
//       </div>
//     </div>
//   );
// }



"use client";

export default function Legend() {
  return (
    <div
      className="bg-white rounded-xl shadow-lg p-4 w-36 text-sm"
      style={{
        position: "fixed",
        left: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 120,
      }}
    >
      <h4 className="font-semibold mb-2">Legend</h4>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
        <span>High Risk</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0"></span>
        <span>Moderate</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-green-500 shrink-0"></span>
        <span>Safe</span>
      </div>
    </div>
  );
}