"use client";

export default function SOSButton() {
  return (
    // <button
    //   className="
    //     fixed bottom-3 left-1/2 -translate-x-1/2
    //     bg-red-600 text-white
    //     px-12 py-4
    //     text-xl font-bold
    //     rounded-full shadow-2xl
    //     z-[100]
    //     pointer-events-auto
    //   "
    // >
    //   SOS
    // </button>
    <button
      className="
  fixed
        bottom-[4vh]
        left-1/2
        -translate-x-1/2
        bg-red-600
        hover:bg-red-700
        text-white
        font-bold
        px-8
        py-3
        rounded-full
        shadow-2xl
        z-[999]
        text-lg
      "
    >
      SOS
    </button>
  );
}
