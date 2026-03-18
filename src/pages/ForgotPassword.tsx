import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import logoImg from '@/assets/eduadapt-logo.png';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="EduAdapt" className="h-10 w-10 rounded-lg" />
            <span className="font-display font-bold text-2xl text-foreground">EduAdapt</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-xl">
          {sent ? (
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-success/10 w-fit">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-xl font-display font-bold mb-2">Check your email</h2>
              <p className="text-muted-foreground text-sm mb-6">
                We sent a password reset link to <span className="font-medium text-foreground">{email}</span>
              </p>
              <Link to="/auth">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
                </Button>
              </Link>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Reset your password</CardTitle>
                <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>
                        <Mail className="mr-2 h-4 w-4" /> Send Reset Link
                      </>
                    )}
                  </Button>
                  <Link to="/auth" className="block text-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <ArrowLeft className="mr-1 h-3 w-3" /> Back to login
                    </Button>
                  </Link>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
