import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useProduct } from '@/hooks/useProducts';
import { useCreateReport } from '@/hooks/useCreateReport';
import { useWorldApp } from '@/contexts/WorldAppContext';

const REPORT_REASONS = [
  { value: 'counterfeit', label: 'Counterfeit / Fake' },
  { value: 'listing_discrepancy', label: 'Listing Discrepancy' },
  { value: 'fraudulent_activity', label: 'Fraudulent Activity' },
  { value: 'prohibited_item', label: 'Prohibited Item' },
  { value: 'suspicious_pricing', label: 'Suspicious Pricing' },
  { value: 'other', label: 'Other' },
];

const ReportProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useWorldApp();
  const { data: product, isLoading } = useProduct(id!);
  const createReport = useCreateReport();

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !description.trim() || !user) return;
    setSubmitError(false);
    try {
      await createReport.mutateAsync({
        productId: id!,
        reporterId: user.id,
        reason,
        description: description.trim(),
        reporterContact: contact.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      if (err?.code === '23505') {
        setSubmitError(true);
        setSubmitted(true); // treat duplicate as "already reported"
      } else {
        setSubmitError(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  // Success state
  if (submitted && !submitError) {
    return (
      <div className="pb-20">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/product/${id}`)}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Report Product</h1>
          </div>
        </div>
        <div className="p-4 flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Report Submitted</h2>
          <p className="text-muted-foreground max-w-sm">
            Thank you for helping keep our marketplace safe. We'll review your report and take appropriate action.
          </p>
          <Button onClick={() => navigate(`/product/${id}`)}>Back to Product</Button>
        </div>
      </div>
    );
  }

  // Duplicate report state
  if (submitted && submitError) {
    return (
      <div className="pb-20">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/product/${id}`)}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Report Product</h1>
          </div>
        </div>
        <div className="p-4 flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Unable to Submit</h2>
          <p className="text-muted-foreground max-w-sm">
            You may have already reported this product, or something went wrong. Please try again later.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/product/${id}`)}>Back to Product</Button>
            <Button onClick={() => { setSubmitted(false); setSubmitError(false); }}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Report Product</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Product Summary */}
        {product && (
          <div className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-14 w-14 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{product.title}</p>
              <p className="text-sm text-primary font-semibold">
                {product.price} {product.currency}
              </p>
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Why are you reporting this product?</Label>
          <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <div
                key={r.value}
                className="flex items-center space-x-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setReason(r.value)}
              >
                <RadioGroupItem value={r.value} id={r.value} />
                <Label htmlFor={r.value} className="cursor-pointer flex-1 font-normal">
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-semibold">
            Describe the issue <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Please provide as much detail as possible about the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right">{description.length}/1000</p>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <Label htmlFor="contact" className="text-base font-semibold">
            Your contact info <span className="text-muted-foreground font-normal text-sm">(optional)</span>
          </Label>
          <Input
            id="contact"
            placeholder="Email or phone number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={255}
          />
          <p className="text-xs text-muted-foreground">In case we need to follow up on your report.</p>
        </div>

        {/* Submit */}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!reason || !description.trim() || createReport.isPending}
        >
          <Flag size={16} className="mr-2" />
          {createReport.isPending ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </div>
  );
};

export default ReportProduct;
