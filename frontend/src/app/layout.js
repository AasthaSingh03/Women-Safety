import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
  title: "Women's Safety App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="h-screen w-screen overflow-hidden"
        style={{ touchAction: "auto" }}
      >
        {children}
      </body>
    </html>
  );
}