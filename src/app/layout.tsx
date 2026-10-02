import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Project H.A.N.D.S. Prototype",
    template: "%s | Project H.A.N.D.S. Prototype",
  },
  description:
    "An independent technical prototype for tablet-based dexterity exercise and progress tracking.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#123e45",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
