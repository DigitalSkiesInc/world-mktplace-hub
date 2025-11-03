import { Phone, Copy, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { formatPhoneNumber } from '@/lib/locationUtils';

interface ContactSellerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerName: string;
  phoneNumber: string;
}

export function ContactSellerDialog({
  open,
  onOpenChange,
  sellerName,
  phoneNumber,
}: ContactSellerDialogProps) {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  // Remove all non-digit characters for links
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    toast({
      title: 'Copied!',
      description: 'Phone number copied to clipboard',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {sellerName}</DialogTitle>
          <DialogDescription>
            How you'd like to contact the seller?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
            <div className="text-center">
              <Phone className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-2xl font-mono font-semibold">{formattedPhone}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleCopy}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Number
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <a href={`tel:${phoneNumber}`}>
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </a>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <a 
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
