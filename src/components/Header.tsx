import { Link } from "react-router-dom";
import { FileArchive, Menu, X, Coffee, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// CONFIGURATION: Replace with your Buy Me a Coffee username
const BUY_ME_COFFEE_URL = "https://buymeacoffee.com/finvestech01";

const MORE_TOOLS = [
  { to: "/crop", label: "Image Cropper" },
  { to: "/heic-to-jpg", label: "HEIC to JPG" },
  { to: "/svg-to-png", label: "SVG to PNG" },
  { to: "/pdf-merge", label: "Merge PDF" },
  { to: "/pdf-split", label: "Split PDF" },
  { to: "/qr-generator", label: "QR Generator" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-smooth group-hover:scale-105 shadow-card">
              <FileArchive className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">Finvestech Tools</span>
              <span className="text-xs text-muted-foreground block -mt-1">Compress • Convert • Crop • More</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/compress" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">Compress</Link>
            <Link to="/convert" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">Convert</Link>
            <Link to="/resize" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">Resize</Link>

            {/* More Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-smooth py-2">
                More Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 pt-0 z-50">
                  {/* Invisible bridge to connect trigger to dropdown (prevents gap) */}
                  <div className="h-2" />
                  <div className="w-48 bg-popover border border-border rounded-lg shadow-lg p-1">
                    {MORE_TOOLS.map((tool) => (
                      <Link
                        key={tool.to}
                        to={tool.to}
                        className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-smooth"
                        onClick={() => setMoreOpen(false)}
                      >
                        {tool.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">About</Link>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => window.open(BUY_ME_COFFEE_URL, '_blank', 'noopener,noreferrer')}
            >
              <Coffee className="w-4 h-4" />
              Support Us
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-2">
            <Link to="/compress" className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth" onClick={() => setMobileMenuOpen(false)}>Compress</Link>
            <Link to="/convert" className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth" onClick={() => setMobileMenuOpen(false)}>Convert</Link>
            <Link to="/resize" className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth" onClick={() => setMobileMenuOpen(false)}>Resize</Link>

            <div className="pl-2 border-l-2 border-primary/30 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-1">More Tools</p>
              {MORE_TOOLS.map((tool) => (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="block py-1.5 text-sm text-foreground hover:text-primary transition-smooth"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tool.label}
                </Link>
              ))}
            </div>

            <Link to="/about" className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground mt-2"
              onClick={() => {
                window.open(BUY_ME_COFFEE_URL, '_blank', 'noopener,noreferrer');
                setMobileMenuOpen(false);
              }}
            >
              <Coffee className="w-4 h-4" />
              Support Us
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
