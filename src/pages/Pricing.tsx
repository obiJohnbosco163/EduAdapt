import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import {
  ArrowLeft, CheckCircle2, Star, Zap, Crown, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: '₦0',
    period: 'forever',
    description: 'Get started with core features',
    badge: null,
    features: [
      '3 subjects (Maths, English, Physics)',
      '5 topics per subject',
      'Step-by-Step mode only',
      'Basic AI Tutor (10 chats/day)',
      'Progress tracking',
    ],
    cta: 'Start Free',
    variant: 'outline' as const,
    highlight: false,
  },
  {
    name: 'Student',
    price: '₦1,500',
    period: '/month',
    description: 'Everything you need to ace WAEC',
    badge: 'Most Popular',
    features: [
      'All 22+ WAEC subjects',
      'Unlimited topics & lessons',
      'All 4 learning modes',
      'Unlimited AI Tutor chats',
      'Offline downloads',
      'Study streak rewards',
      'WAEC past questions',
      'Priority support',
    ],
    cta: 'Get Student Plan',
    variant: 'default' as const,
    highlight: true,
  },
  {
    name: 'School',
    price: '₦500',
    period: '/student/month',
    description: 'For schools & coaching centers',
    badge: 'Best Value',
    features: [
      'Everything in Student plan',
      'Admin dashboard',
      'Student progress reports',
      'Class performance analytics',
      'Bulk student accounts',
      'Custom branding',
      'Dedicated support',
      'Min. 20 students',
    ],
    cta: 'Contact Us',
    variant: 'outline' as const,
    highlight: false,
  },
];

const yearlyPlans = [
  { name: 'Student Annual', price: '₦12,000', savings: '₦6,000 saved', period: '/year' },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size="sm" />
          </Link>
          <Link to="/auth">
            <Button size="sm" className="rounded-full px-5">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-6 pt-12 sm:pt-20 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="h-3 w-3" /> Student-friendly pricing
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Pricing that <span className="text-primary">works for you</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Affordable plans designed for Nigerian secondary school students. Start free, upgrade anytime.
          </p>
        </motion.div>
      </section>

      {/* Plans */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={cn(
                "h-full relative",
                plan.highlight && "border-primary ring-2 ring-primary/20 shadow-xl"
              )}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-lg">
                      {plan.badge === 'Most Popular' && <Star className="h-3 w-3 mr-1" />}
                      {plan.badge === 'Best Value' && <Crown className="h-3 w-3 mr-1" />}
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2 pt-8">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-display font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth">
                    <Button
                      variant={plan.variant}
                      className={cn("w-full", plan.highlight && "shadow-lg")}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Annual savings */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-6 sm:p-8 text-center">
              <Zap className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-display font-bold mb-2">Save with Annual Plan</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Pay <span className="font-bold text-foreground">₦12,000/year</span> instead of ₦18,000 — save ₦6,000!
              </p>
              <Link to="/auth">
                <Button className="rounded-full px-8">Get Annual Plan</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-center mb-8">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I try before I pay?', a: 'Yes! The Free plan gives you access to 3 subjects with no time limit. Upgrade only when you need more.' },
              { q: 'How do I pay?', a: 'We accept bank transfers, card payments, and mobile money. Payment is processed securely through Paystack.' },
              { q: 'Can I cancel anytime?', a: 'Absolutely. No lock-in contracts. Cancel your subscription anytime and keep access until the end of your billing period.' },
              { q: 'Is there a discount for WAEC exam students?', a: 'Yes! SS3 students get 20% off the Student plan during WAEC season (February–June). Contact us for the code.' },
            ].map(({ q, a }) => (
              <Card key={q}>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-1">{q}</h4>
                  <p className="text-sm text-muted-foreground">{a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} EduAdapt. Built for Nigerian students.
        </p>
      </footer>
    </div>
  );
}
