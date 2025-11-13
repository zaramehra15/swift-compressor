import { Link } from "react-router-dom";
import { FileArchive, Menu, X, Coffee } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// CONFIGURATION: Replace with your Buy Me a Coffee username
const BUY_ME_COFFEE_URL = "https://www.buymeacoffee.com/YOUR_USERNAME";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <span className="text-xs text-muted-foreground block -mt-1">Compress • Convert • Resize</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/compress" 
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              Compress
            </Link>
            <Link 
              to="/convert" 
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              Convert
            </Link>
            <Link 
              to="/resize" 
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              Resize
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              Contact
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => window.open(BUY_ME_COFFEE_URL, '_blank')}
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
            <Link 
              to="/compress" 
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              Compress
            </Link>
            <Link 
              to="/convert" 
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              Convert
            </Link>
            <Link 
              to="/resize" 
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              Resize
            </Link>
            <Link 
              to="/about" 
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground mt-2"
              onClick={() => {
                window.open(BUY_ME_COFFEE_URL, '_blank');
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
