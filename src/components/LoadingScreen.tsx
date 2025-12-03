import { Loader2, ShoppingBag } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = "Loading..." }: LoadingScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background">
      {/* App Logo */}
      <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
        <ShoppingBag size={36} className="text-white" />
      </div>
      
      {/* App Name */}
      <h1 className="text-xl font-bold text-foreground mb-6">
        World Marketplace
      </h1>
      
      {/* Loading Spinner */}
      <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
      
      {/* Loading Text */}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};
