import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 Finvestech. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-smooth"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-sm text-muted-foreground hover:text-primary transition-smooth"
            >
              About
            </Link>
            <Link 
              to="/privacy" 
              className="text-sm text-muted-foreground hover:text-primary transition-smooth"
            >
              Privacy Policy
            </Link>
            <a 
              href="https://finvestech.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-smooth"
            >
              Finvestech.in
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
