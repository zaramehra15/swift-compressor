import { Link } from "react-router-dom";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

// CONFIGURATION: Replace with your Buy Me a Coffee username
const BUY_ME_COFFEE_URL = "https://buymeacoffee.com/zaramehra1z";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-foreground mb-2">Finvestech Tools</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Free online tools for compressing, converting, and resizing files. All processing happens in your browser for maximum privacy and security.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => window.open(BUY_ME_COFFEE_URL, '_blank')}
            >
              <Coffee className="w-4 h-4" />
              Buy Me a Coffee
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Tools</h4>
              <div className="space-y-2">
                <Link 
                  to="/compress" 
                  className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  Compress
                </Link>
                <Link 
                  to="/convert" 
                  className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  Convert
                </Link>
                <Link 
                  to="/resize" 
                  className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  Resize
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Company</h4>
              <div className="space-y-2">
                <Link 
                  to="/about" 
                  className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  Contact
                </Link>
                <a 
                  href="https://finvestech.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  Finvestech.in
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
              <div className="space-y-2">
                <Link 
                  to="/privacy" 
                  className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/terms" 
                  className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Finvestech. All rights reserved. Made with ❤️ for privacy-conscious users worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
