import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MessageCircle, Phone, Shield, AlertTriangle, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const BuyerGuide: React.FC = () => {
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
              How to Buy on World Marketplace
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="text-primary" />
              Welcome to World Marketplace
            </CardTitle>
            <CardDescription>
              A secure platform for verified World ID users to buy and sell
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              World Marketplace connects verified buyers and sellers. This guide will help you 
              navigate the purchasing process safely and effectively.
            </p>
          </CardContent>
        </Card>

        {/* How to Purchase */}
        <Card>
          <CardHeader>
            <CardTitle>How to Purchase a Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold text-sm">Browse and Find Products</h3>
                <p className="text-sm text-muted-foreground">
                  Search for products using the search bar or browse by category. 
                  Filter by condition, price, and location to find what you need.
                </p>
              </div>
            </div>

            <Separator />

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold text-sm">View Product Details</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any product to view detailed information including images, 
                  description, price, condition, and seller information.
                </p>
              </div>
            </div>

            <Separator />

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="font-semibold text-sm">Contact the Seller</h3>
                <p className="text-sm text-muted-foreground">
                  You have two ways to contact sellers:
                </p>
                <div className="space-y-2 pl-4">
                  <div className="flex items-start gap-2">
                    <MessageCircle size={16} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">In-App Messaging</p>
                      <p className="text-xs text-muted-foreground">
                        Click "Contact Seller" to send a message through our platform
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone size={16} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Phone Contact</p>
                      <p className="text-xs text-muted-foreground">
                        If available, you can call the seller directly using the provided phone number
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                4
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold text-sm">Negotiate and Arrange</h3>
                <p className="text-sm text-muted-foreground">
                  Discuss with the seller to:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside pl-2">
                  <li>Negotiate the final price</li>
                  <li>Agree on payment method</li>
                  <li>Decide on delivery or pickup</li>
                  <li>Schedule a meetup (if in-person)</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                5
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold text-sm">Complete the Transaction</h3>
                <p className="text-sm text-muted-foreground">
                  Once you've agreed on terms, complete your purchase according to 
                  the arrangement you made with the seller.
                </p>
              </div>
            </div>
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
                  the seller and feel comfortable with the transaction.
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Meet in Public Places:</strong> If meeting in person, always choose 
                  a public, well-lit location
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <Shield size={16} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Verify Before Paying:</strong> When possible, inspect the product 
                  before making payment.
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

        {/* Additional Tips */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Check the seller's verification badge and rating to gauge trustworthiness
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
          </CardContent>
        </Card> */}

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link to="/categories" className="w-full">
            <Button className="w-full">
              Start Shopping Now
            </Button>
          </Link>
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

export default BuyerGuide;
