import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Store, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import heroImage from '@/assets/hero-shoppr.jpg';

const MerchantSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, initiateGoogleAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password, role: 'MERCHANT' });
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in to your merchant account.',
      });
      navigate('/merchant/dashboard');
    } catch (error) {
      toast({
        title: 'Sign in failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    initiateGoogleAuth('MERCHANT');
  };

  return (
    <div 
      className="min-h-screen bg-contain bg-top bg-no-repeat relative"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Very Light Fade Effect - Multiple layers for extremely subtle image */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/60"></div>
      <div className="absolute inset-0 bg-orange-50/30"></div>
      <div className="absolute inset-0 bg-white/20"></div>
      
      {/* Header - Completely transparent */}
      <header className="relative z-40 bg-transparent backdrop-blur-sm sticky top-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 bg-clip-text text-transparent drop-shadow-sm tracking-tight">Shoppr</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-orange-50/60 to-orange-100/40 backdrop-blur-sm relative border border-orange-200/50">
          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-orange-700 hover:text-orange-900 hover:bg-orange-100/50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          
          <CardHeader className="space-y-1 text-center pt-12">
            <div className="mx-auto w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
              <Store className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-orange-900">Merchant Login</CardTitle>
            <CardDescription className="text-orange-700">
              Sign in to your merchant account to manage your store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-orange-800">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    required
                    className="pl-10 bg-white/60 border-orange-200/70 focus:border-orange-500 focus:ring-orange-500 text-orange-900 placeholder-orange-400"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-orange-800">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    required
                    className="pl-10 pr-10 bg-white/60 border-orange-200/70 focus:border-orange-500 focus:ring-orange-500 text-orange-900 placeholder-orange-400"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-orange-500 hover:text-orange-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-orange-200/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-br from-orange-50/60 to-orange-100/40 px-2 text-orange-600 font-medium">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-orange-200/70 hover:bg-orange-50/50 text-orange-700 hover:text-orange-800"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center text-sm text-orange-700">
              Don't have an account?{' '}
              <Link
                to="/auth/merchant/signup"
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer - Appears on page 2+ */}
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default MerchantSignIn;
