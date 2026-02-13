import { useState } from 'react';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Shield, Zap, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#FEFBFF] dark:bg-[#1C1B1F]">
      {/* Animated Background - Material Design */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6750A4]/5 via-transparent to-[#1C1B1F]/5 dark:from-[#D0BCFF]/5 dark:via-transparent dark:to-[#1C1B1F]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(103,80,164,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(103,80,164,0.08),transparent_50%)]" />
      </div>

      {/* Left side - Premium Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-16 relative z-10">
        <div className="max-w-lg text-center space-y-10">
          {/* Main Logo with Material Elevation */}
          <div className="flex justify-center mb-12 relative">
            <div className="absolute inset-0 bg-[#6750A4]/10 blur-3xl rounded-full" />
            <div className="relative">
              <img 
                src="/brakediscmain.png" 
                alt="BrakeDisc Twin" 
                className="max-w-full h-auto object-contain relative z-10"
                style={{ maxHeight: '300px', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))' }}
              />
            </div>
          </div>

          {/* Branding Text - Material Typography */}
          <div className="space-y-4">
            <h2 className="text-5xl font-light text-[#0F172A] dark:text-[#E5E7EB] mb-3 tracking-tight">
              BrakeDisc Twin
            </h2>
            <p className="text-xl font-normal text-[#4B5563] dark:text-[#CBD5F5]">
              Predictive maintenance cockpit for fleet brake discs
            </p>
            <p className="text-base text-[#4B5563] dark:text-[#CBD5F5] leading-relaxed max-w-md mx-auto">
              Monitor, analyse and optimise the condition of your fleet&apos;s brake discs with data-driven KPIs and forecasts.
            </p>
          </div>

          {/* Feature Pills - Material Design */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            <Badge variant="outline" className="bg-white/80 dark:bg-[#2D2C30]/80 border-[#E7E0EC] dark:border-[#49454F] text-slate-900 dark:text-slate-100 px-4 py-2 rounded-full shadow-sm">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="bg-white/80 dark:bg-[#2D2C30]/80 border-[#E7E0EC] dark:border-[#49454F] text-slate-900 dark:text-slate-100 px-4 py-2 rounded-full shadow-sm">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Real-Time
            </Badge>
            <Badge variant="outline" className="bg-white/80 dark:bg-[#2D2C30]/80 border-[#E7E0EC] dark:border-[#49454F] text-slate-900 dark:text-slate-100 px-4 py-2 rounded-full shadow-sm">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Predictive
            </Badge>
          </div>
          
          {/* Company Logos - White background for visibility */}
          <div className="flex items-center justify-center gap-8 mt-16 pt-8 border-t border-[#E7E0EC] dark:border-[#49454F]">
            <div className="flex items-center gap-4 px-8 py-4 bg-white dark:bg-[#2D2C30] rounded-3xl shadow-lg">
              <img 
                src="/dataciders.png" 
                alt="DataCiders" 
                className="h-10 w-auto object-contain opacity-100"
              />
              <div className="w-px h-10 bg-[#E7E0EC] dark:bg-[#49454F]" />
              <img 
                src="/ar.png" 
                alt="AR" 
                className="h-10 w-auto object-contain opacity-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Material Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center gap-4 mb-10 lg:hidden">
            <img 
              src="/brakediscmain.png" 
              alt="BrakeDisc Twin" 
              className="h-24 w-auto object-contain"
            />
            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-[#020817] rounded-2xl shadow-lg">
              <img 
                src="/dataciders.png" 
                alt="DataCiders" 
                className="h-7 w-auto object-contain opacity-100"
              />
              <div className="w-px h-7 bg-[#E7E0EC] dark:bg-[#49454F]" />
              <img 
                src="/ar.png" 
                alt="AR" 
                className="h-7 w-auto object-contain opacity-100"
              />
            </div>
          </div>

          {/* Material Design Card */}
          <Card className="w-full shadow-lg border-0 bg-white/95 dark:bg-[#020817]/95 backdrop-blur-xl rounded-3xl">
            <CardHeader className="space-y-1 pb-8 pt-10">
              <div className="text-center space-y-2">
                <CardTitle className="text-3xl font-light dark:text-[#E5E7EB]">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-base dark:text-[#CBD5F5] mt-2">
                  Sign in to access your predictive maintenance cockpit.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-3 p-4 text-sm text-[#BA1A1A] dark:text-[#FFB4AB] bg-[#BA1A1A]/8 dark:bg-[#FFB4AB]/12 rounded-2xl border-0 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium dark:text-[#E5E7EB]">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium dark:text-[#E5E7EB]">
                      Password
                    </Label>
                    <a
                      href="#"
                      className="text-sm text-mercedes-accent hover:underline transition-colors font-medium"
                      onClick={(e) => e.preventDefault()}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-mercedes-accent hover:bg-mercedes-accent-dark text-white shadow-sm hover:shadow-md transition-all rounded-full mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Sign in
                    </>
                  )}
                </Button>

                {/* Demo Mode Notice - Material Design */}
                <div className="pt-6 border-t border-[#E7E0EC] dark:border-[#49454F]">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-mercedes-accent/10 dark:bg-mercedes-accent/15 border-0">
                    <div className="w-5 h-5 rounded-full bg-mercedes-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white dark:text-slate-900 text-xs font-bold">i</span>
                    </div>
                    <div className="text-sm flex-1">
                      <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        Demo mode
                      </div>
                      <div className="text-slate-700 dark:text-slate-200 leading-relaxed">
                        Use any email and password to explore the cockpit with demo data.
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#4B5563] dark:text-[#CBD5F5]">
              Powered by <span className="font-medium text-[#0F172A] dark:text-[#E5E7EB]">BrakeDisc Twin</span> • Predictive maintenance platform for fleets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
