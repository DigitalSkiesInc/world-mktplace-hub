import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from "@worldcoin/minikit-js";
import { useWorldApp } from "@/contexts/WorldAppContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";

export default function Login() {
  const { verifyWorldId, user, isLoading } = useWorldApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleSignIn = async () => {
    if (!MiniKit.isInstalled()) {
      toast({
        title: "World App Not Found",
        description: "Please open this app in World App to sign in with World ID.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const verifyPayload: VerifyCommandInput = {
        action: 'login',
        verification_level: VerificationLevel.Device,
      };

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      if (finalPayload.status === 'error') {
        throw new Error('Verification failed');
      }

      const verifyResponse = finalPayload as ISuccessResult;

      await verifyWorldId(
        verifyResponse.proof,
        verifyResponse.nullifier_hash,
        verifyResponse.verification_level as 'orb' | 'device'
      );

      toast({
        title: "Welcome!",
        description: "You've been successfully verified with World ID.",
      });

      navigate('/');
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify your World ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            World Marketplace
          </h1>
          <p className="text-muted-foreground text-lg">
            Buy and sell with verified humans
          </p>
        </div>

        <div className="bg-card rounded-xl p-8 shadow-lg border border-border">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Verify with World ID
            </h2>
            <p className="text-sm text-muted-foreground">
              Prove you're a unique human to access the marketplace
            </p>
          </div>

          <Button
            onClick={handleSignIn}
            disabled={isVerifying}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Sign In with World ID'
            )}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
