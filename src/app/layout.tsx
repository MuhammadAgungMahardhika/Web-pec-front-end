import Script from "next/script";
import { Metadata } from "next";
import "../scss/app.scss";
import "../scss/iconly.scss";
import "../scss/themes/dark/app-dark.scss";
import Sidebar from "./Sidebar";
import { StrictMode } from "react";
const baseUrl = process.env.BASE_URL;
export const metadata: Metadata = {
  title: "Padang Eye Center",
  description: "Simrs Padang Eye Center",
  icons: [
    {
      url: "/favicon.svg",
      type: "image/x-icon",
      rel: "shortcut icon",
    },
    {
      url: "/favicon.png",
      type: "image/png",
      rel: "shortcut icon",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-bs-theme="light">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className="light dark">
        <div id="app">
          <div id="sidebar" className="active sidebar-desktop">
            <Sidebar />
          </div>
          <div id="main">
            <header className="mb-3">
              <a href="#" className="burger-btn d-block d-xl-none">
                <i className="bi bi-justify fs-3"></i>
              </a>
            </header>
            {children}
          </div>
        </div>
      </body>
      <Script src="/assets/js/index.js" />
      <Script src="/assets/js/sidebar.js" />
    </html>
  );
}
