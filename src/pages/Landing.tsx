import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import logoImg from '@/assets/eduadapt-logo.png';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Target,
  Wifi,
  WifiOff,
  Sparkles,
  Trophy,
  Users,
  Star,
  ChevronRight,
  Zap,
  CheckCircle2,
  GraduationCap,
  BarChart3,
  Shield,
  Flame,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

const subjects = [
  { name: 'Mathematics', icon: '📐', color: 'bg-primary/10 text-primary' },
  { name: 'English', icon: '📝', color: 'bg-accent/10 text-accent' },
  { name: 'Physics', icon: '⚡', color: 'bg-eduadapt-teal/10 text-eduadapt-teal' },
  { name: 'Chemistry', icon: '🧪', color: 'bg-eduadapt-purple/10 text-eduadapt-purple' },
  { name: 'Biology', icon: '🧬', color: 'bg-success/10 text-success' },
  { name: 'Economics', icon: '📊', color: 'bg-destructive/10 text-destructive' },
];

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Tutor',
    description: 'Get instant explanations adapted to your learning style',
  },
  {
    icon: Target,
    title: 'Adaptive Learning',
    description: 'Content adjusts to your pace — slow, average, or fast',
  },
  {
    icon: WifiOff,
    title: 'Works Offline',
    description: 'Download lessons and study anywhere, even without data',
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    description: 'Visual dashboard showing your growth across all subjects',
  },
];

const stats = [
  { value: '22+', label: 'WAEC Subjects' },
  { value: '100+', label: 'Topics Covered' },
  { value: '4', label: 'Learning Modes' },
  { value: '24/7', label: 'AI Tutor Access' },
];

const testimonials = [
  { name: 'Chioma A.', school: 'FGGC Benin', text: 'EduAdapt helped me go from D7 to B3 in Maths!', stars: 5 },
  { name: 'Emeka O.', school: 'Kings College Lagos', text: 'The AI tutor explains things better than my teacher.', stars: 5 },
  { name: 'Fatima B.', school: 'Queens College', text: 'I love studying offline on the bus to school.', stars: 4 },
];

const floatingWords = ['Algebra', 'Calculus', 'Grammar', 'Atoms', 'Forces', 'Cells', 'Supply', 'Demand'];

export default function Landing() {
  const { user, profile, loading } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return null;
  if (user) {
    return profile?.onboarding_completed ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="EduAdapt" className="h-9 w-9 rounded-lg" />
            <span className="font-display font-bold text-xl text-foreground">EduAdapt</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Log in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="rounded-full px-5">
                Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingWords.map((word, i) => (
            <motion.span
              key={word}
              className="absolute text-xs font-mono text-muted-foreground/20 select-none"
              style={{
                top: `${15 + (i * 12) % 80}%`,
                left: `${5 + (i * 17) % 90}%`,
              }}
              animate={{ y: [0, -10, 0], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered WAEC Prep</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Master WAEC.{' '}
            <span className="bg-gradient-to-r from-primary to-eduadapt-purple bg-clip-text text-transparent">
              Your Way.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Personalized lessons that adapt to your speed. AI tutor that never sleeps.
            Works offline. Built for Nigerian students who want to{' '}
            <span className="text-foreground font-semibold">excel</span>.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/auth">
              <Button size="lg" className="rounded-full px-8 text-base h-13 shadow-xl shadow-primary/20">
                Start Learning Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-full px-8 text-base h-13 gap-2">
              <Play className="h-4 w-4" /> Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-14 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Subjects Ribbon */}
      <section className="py-10 border-y border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium uppercase tracking-wider">
            All major WAEC subjects covered
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {subjects.map((subject, i) => (
              <motion.div
                key={subject.name}
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/50", subject.color)}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <span className="text-lg">{subject.icon}</span>
                <span className="text-sm font-medium">{subject.name}</span>
              </motion.div>
            ))}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-dashed border-border text-muted-foreground">
              <span className="text-sm font-medium">+16 more</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <motion.h2
              className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Everything you need to{' '}
              <span className="text-primary">ace WAEC</span>
            </motion.h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Built specifically for Nigerian students preparing for their exams.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-border/50 hover:shadow-lg hover:border-primary/20 transition-all group">
                    <CardContent className="p-6 sm:p-8">
                      <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/15 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-display font-bold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Modes */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              4 ways to learn,{' '}
              <span className="text-accent">your choice</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: BookOpen, title: 'Step-by-Step', desc: 'Detailed walkthroughs', color: 'border-primary/30 bg-primary/5' },
              { icon: Target, title: 'Practice Heavy', desc: 'Learn by doing', color: 'border-eduadapt-teal/30 bg-eduadapt-teal/5' },
              { icon: Zap, title: 'Fast Revision', desc: 'Quick summaries', color: 'border-accent/30 bg-accent/5' },
              { icon: Trophy, title: 'Challenge', desc: 'Test your limits', color: 'border-eduadapt-purple/30 bg-eduadapt-purple/5' },
            ].map((mode, i) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.title}
                  className={cn("rounded-2xl border p-5 sm:p-6 text-center", mode.color)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Icon className="h-8 w-8 mx-auto mb-3 text-foreground" />
                  <h3 className="font-display font-bold text-sm sm:text-base mb-1">{mode.title}</h3>
                  <p className="text-xs text-muted-foreground">{mode.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Students love{' '}
              <span className="text-primary">EduAdapt</span>
            </motion.h2>
          </div>

          <div className="max-w-md mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="flex justify-center gap-1 mb-4">
                      {Array.from({ length: testimonials[activeTestimonial].stars }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-foreground text-lg mb-4 italic">
                      "{testimonials[activeTestimonial].text}"
                    </p>
                    <p className="font-semibold">{testimonials[activeTestimonial].name}</p>
                    <p className="text-sm text-muted-foreground">{testimonials[activeTestimonial].school}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === activeTestimonial ? "bg-primary w-6" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 bg-gradient-to-br from-primary to-eduadapt-purple overflow-hidden relative">
            <CardContent className="p-8 sm:p-12 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <GraduationCap className="h-12 w-12 text-primary-foreground mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary-foreground mb-3">
                  Ready to start your journey?
                </h2>
                <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
                  Join thousands of Nigerian students who are acing their WAEC exams with EduAdapt.
                </p>
                <Link to="/auth">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full px-10 text-base font-semibold"
                  >
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="EduAdapt" className="h-7 w-7 rounded-md" />
            <span className="font-display font-bold text-foreground">EduAdapt</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <a
              href="https://linkedin.com/company/officialeduadapt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EduAdapt. Built for Nigerian students.
          </p>
        </div>
      </footer>
    </div>
  );
}
