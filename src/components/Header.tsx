import { Link } from "react-router-dom";
import { FileArchive } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-smooth group-hover:scale-105 shadow-card">
            <FileArchive className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xl font-bold text-foreground">Compress</span>
            <span className="text-xs text-muted-foreground block -mt-1">by Finvestech</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            About
          </Link>
          <Link 
            to="/privacy" 
            className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            Privacy
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
