import { useState } from 'react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from './AuthProvider';
import { UpdateCredentialsDialog } from './UpdateCredentialsDialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LogOut, User, Flame, Code2, TrendingUp, Settings, BookOpen } from 'lucide-react';

import logoImage from '../assets/abcbb2417947ea1ee22e01da22eb435a604de399.png';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface NavbarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  userStreak?: number;
  onLogoClick?: () => void;
}

export function Navbar({ currentTab = 'practice', onTabChange, userStreak = 0, onLogoClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showUpdateCredentials, setShowUpdateCredentials] = useState(false);

  const tabs = [
    { id: 'practice', label: 'Practice', icon: Code2 },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'resources', label: 'Resources', icon: BookOpen },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          {/* Wordmark */}
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200" 
            onClick={onLogoClick}
          >
            <ImageWithFallback 
              src={logoImage}
              alt="ServiceNext Logo"
              className="w-8 h-8 rounded-lg object-contain"
            />
          </div>

          {/* Navigation Tabs - Show for all users */}
          {onTabChange && (
            <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onTabChange(tab.id)}
                    className={`h-8 transition-all duration-200 ${
                      isActive 
                        ? "bg-background shadow-sm text-foreground hover:bg-background hover:text-foreground" 
                        : "hover:bg-background/70 dark:hover:bg-background/30 text-muted-foreground hover:text-foreground dark:hover:text-foreground"
                    }`}
                    style={{ fontFamily: 'Chivo, sans-serif' }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline-block ml-2">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          )}

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            {/* Streak Counter - Only show when user is logged in */}
            {user && (
              <div className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <Badge variant="secondary" className="text-xs font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  {userStreak} day{userStreak !== 1 ? 's' : ''}
                </Badge>
              </div>
            )}
            
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center space-x-2 h-10"
                    style={{ fontFamily: 'Chivo, sans-serif' }}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom" className="w-56">
                  <div className="px-2 py-1.5 text-sm" style={{ fontFamily: 'Chivo, sans-serif' }}>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowUpdateCredentials(true)}
                    className="flex items-center space-x-2 cursor-pointer"
                    style={{ fontFamily: 'Chivo, sans-serif' }}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="flex items-center space-x-2 cursor-pointer text-destructive focus:text-destructive"
                    style={{ fontFamily: 'Chivo, sans-serif' }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onTabChange?.('auth')}
                className="flex items-center space-x-2 h-10"
                style={{ fontFamily: 'Chivo, sans-serif' }}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline-block">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Update Credentials Dialog */}
      <UpdateCredentialsDialog 
        open={showUpdateCredentials} 
        onOpenChange={setShowUpdateCredentials}
      />
    </>
  );
}