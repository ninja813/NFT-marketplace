import './globals.css';
import localFont from 'next/font/local';
import Link from 'next/link';
import { AuthProvider } from '../components/AuthProvider';
import AuthControls from '../components/AuthControls';
import Head from 'next/head';

const inter = localFont({
  src: [
    { path: './fonts/Inter-Regular.woff2', weight: '400' },
    { path: './fonts/Inter-Bold.woff2', weight: '700' },
  ],
});

export const metadata = {
  title: 'Spectra Market',
  description: 'Modern NFT Marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-ink min-h-screen`}>
        <div className="min-h-screen bg-hero-gradient flex flex-col">
          <AuthProvider>
            <Header />
            <main className="flex-1">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 ">
                {children}
              </div>
            </main>
            <Footer />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="header-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="logo-dot group-hover:scale-105 transition-transform" />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link className="nav-link" href="/market">
              Market
            </Link>
            <Link className="nav-link" href="/collections">
              Collections
            </Link>
            <Link className="nav-link" href="/create">
              Create
            </Link>
            <AuthControls />
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-white/60">
        © {new Date().getFullYear()} Spectra Market. Crafted with gradients and
        glass.
      </div>
    </footer>
  );
}
