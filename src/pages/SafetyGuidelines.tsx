import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, MapPin, CheckCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';

const SafetyGuidelines: React.FC = () => {
  const { data: platformConfig } = usePlatformConfig();
  const supportContact = platformConfig?.support_contact || { email: null, phone: null };

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-foreground">
              Safety Guidelines
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-primary" />
              Stay Safe on World Marketplace
            </CardTitle>
            <CardDescription>
              Your safety is our priority. Follow these guidelines for secure transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              World Marketplace connects verified buyers and sellers. While we verify all users 
              through World ID, we recommend following these safety guidelines to protect yourself 
              during transactions.
            </p>
          </CardContent>
        </Card>

        {/* Safety Guidelines */}
        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">
            Important Safety Guidelines
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200 space-y-3 mt-2">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Pay Sellers You Trust Only:</strong> Only proceed with payment if you trust 
                  the seller and feel comfortable with the transaction. Never send money upfront 
                  without verifying the product.
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Meet in Public Places:</strong> If meeting in person, always choose 
                  a public, well-lit location. Consider meeting at police stations or busy 
                  commercial areas for high-value transactions.
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <Shield size={16} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Verify Before Paying:</strong> When possible, inspect the product 
                  before making payment. Test electronics and verify authenticity of branded items.
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Watch for Red Flags:</strong> Be cautious of deals that seem too 
                  good to be true, sellers who rush you, or requests for unusual payment methods.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Additional Safety Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Safety Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Check the seller's verification badge to ensure they are a verified World ID user
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Read the product description carefully and ask questions if anything is unclear
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Keep all communication within the platform for record-keeping
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Take screenshots of conversations and agreements for your records
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Bring a friend or family member when meeting for high-value transactions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        {(supportContact?.email || supportContact?.phone) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
              <CardDescription>Contact our support team if you encounter any issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {supportContact.email && (
                <a href={`mailto:${supportContact.email}`} className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <Mail size={20} className="text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Email Support</p>
                      <p className="text-xs text-muted-foreground">{supportContact.email}</p>
                    </div>
                  </div>
                </a>
              )}
              {supportContact.phone && (
                <a href={`tel:${supportContact.phone}`} className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <Phone size={20} className="text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Phone Support</p>
                      <p className="text-xs text-muted-foreground">{supportContact.phone}</p>
                    </div>
                  </div>
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link to="/" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SafetyGuidelines;
