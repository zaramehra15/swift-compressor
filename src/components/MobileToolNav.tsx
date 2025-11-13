import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MobileToolNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Tool order for navigation
  const tools = [
    { path: '/compress', label: 'Compress' },
    { path: '/convert', label: 'Convert' },
    { path: '/resize', label: 'Resize' },
  ];

  const currentIndex = tools.findIndex(tool => location.pathname === tool.path);
  
  // If not on a tool page, don't show navigation
  if (currentIndex === -1) return null;

  const handlePrevious = () => {
    const prevIndex = currentIndex === 0 ? tools.length - 1 : currentIndex - 1;
    navigate(tools[prevIndex].path);
  };

  const handleNext = () => {
    const nextIndex = currentIndex === tools.length - 1 ? 0 : currentIndex + 1;
    navigate(tools[nextIndex].path);
  };

  const prevTool = tools[currentIndex === 0 ? tools.length - 1 : currentIndex - 1];
  const nextTool = tools[currentIndex === tools.length - 1 ? 0 : currentIndex + 1];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            className="flex items-center gap-2 text-sm"
            aria-label={`Previous tool: ${prevTool.label}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">{prevTool.label}</span>
          </Button>
          
          <span className="text-xs text-muted-foreground font-medium">
            {tools[currentIndex].label}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="flex items-center gap-2 text-sm"
            aria-label={`Next tool: ${nextTool.label}`}
          >
            <span className="hidden xs:inline">{nextTool.label}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileToolNav;
