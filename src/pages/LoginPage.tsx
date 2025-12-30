import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react'; // Optional: for star icons

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availableCottages, setAvailableCottages] = useState<any[]>([]);
  const [cottagesLoading, setCottagesLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    try {
      // Check query string or hash for token returned by OAuth redirect
      const qs = new URLSearchParams(window.location.search);
      let token = qs.get('token');
      if (!token && window.location.hash) {
        const h = new URLSearchParams(window.location.hash.replace('#', ''));
        token = h.get('token');
      }
      if (token) {
        // Backend sets HTTP-only cookie on OAuth callback; navigate to bookings page
        toast({ title: 'Signed in', description: 'Signed in with Google' });
        window.history.replaceState(null, '', window.location.pathname);
        navigate('/my-bookings');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const doLogin = async () => {
    try {
      const res: any = await apiClient.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res) {
        // Backend sets HTTP-only cookie; treat success as signed in
        toast({ title: 'Signed in', description: 'You are now signed in.' });
        navigate('/my-bookings');
        return true;
      }
    } catch (err: any) {
      toast({ title: 'Sign in error', description: err?.detail || err?.message || 'Login failed' });
    }
    return false;
  };

  // Send OTP handler
  const handleSendOtp = async () => {
    if (!phone) {
      toast({ title: 'Phone required', description: 'Enter your phone number.' });
      return;
    }
    setOtpLoading(true);
    try {
      await apiClient.sendOtp(phone);
      setOtpSent(true);
      toast({ title: 'OTP sent', description: 'Check your phone for the OTP.' });
    } catch (err: any) {
      toast({ title: 'OTP error', description: err?.detail || err?.message || 'Could not send OTP' });
    }
    setOtpLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      // Login with email/password or phone/otp or license key
      try {
        let res: any;
        if (licenseKey) {
          res = await apiClient.keyauthLogin(licenseKey);
        } else if (phone && otp) {
          res = await apiClient.phoneLogin(phone, otp);
        } else {
          res = await apiClient.login(email, password);
        }
        if (res) {
          toast({ title: 'Signed in', description: 'You are now signed in.' });
          navigate('/my-bookings');
        }
      } catch (err: any) {
        toast({ title: 'Sign in error', description: err?.detail || err?.message || 'Login failed' });
      }
      return;
    }

    // Register
    try {
      let reg: any;
      if (licenseKey) {
        reg = await apiClient.keyauthRegister(licenseKey, phone, otp);
      } else if (phone && otp) {
        reg = await apiClient.phoneRegister(phone, otp, firstName || undefined);
      } else {
        reg = await apiClient.register(email, password, firstName || undefined);
      }
      await doLogin();
      toast({ title: 'Account created', description: 'Account created and signed in.' });
    } catch (err: any) {
      toast({ title: 'Register failed', description: err?.detail || err?.message || 'Could not create account' });
    }
  };

  const handleGoogle = () => {
    // Attempt OAuth redirect — backend must implement /auth/oauth/google
    try {
      const env = (import.meta as any).env || {};
      const apiBase = env.VITE_API_URL || env.NEXT_PUBLIC_API_URL || '';
      const target = apiBase ? `${apiBase.replace(/\/$/, '')}/auth/oauth/google` : '/auth/oauth/google';
      window.location.href = target;
    } catch (e) {
      toast({ title: 'Not configured', description: 'Google sign-in is not configured on this server.' });
    }
  };

  // Fetch available cottages when dates are selected
  useEffect(() => {
    if (checkIn && checkOut) {
      setCottagesLoading(true);
      apiClient.getAllCottages({
        availableStart: checkIn,
        availableEnd: checkOut,
      }).then((cottages: any[]) => {
        // Only show cottages with available: true (or not explicitly false)
        setAvailableCottages(
          cottages.filter((c: any) => c.available !== false)
        );
      }).finally(() => setCottagesLoading(false));
    } else {
      setAvailableCottages([]);
    }
  }, [checkIn, checkOut]);

  // Fetch reviews from backend
  useEffect(() => {
    setReviewsLoading(true);
    fetch('/api/reviews')
      .then(res => res.json())
      .then(setReviews)
      .finally(() => setReviewsLoading(false));
  }, []);

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-serif mb-4">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
      <div className="mb-4 flex gap-2">
        <button className={"px-3 py-2 rounded " + (mode === 'login' ? 'bg-primary text-primary-foreground' : 'bg-muted')} onClick={() => setMode('login')}>Sign in</button>
        <button className={"px-3 py-2 rounded " + (mode === 'register' ? 'bg-primary text-primary-foreground' : 'bg-muted')} onClick={() => setMode('register')}>Register</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Your name" required />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Email address" />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Phone number" />
        </div>
        <div className="flex gap-2 items-center">
          <input value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="OTP code" />
          <Button type="button" onClick={handleSendOtp} disabled={otpLoading || !phone}>{otpLoading ? 'Sending...' : (otpSent ? 'Resend OTP' : 'Send OTP')}</Button>
        </div>
        <div>
          <label className="block text-sm mb-1">License Key (KeyAuth)</label>
          <input value={licenseKey} onChange={e => setLicenseKey(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="KEYAUTH-..." />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Password" />
        </div>
        <div className="flex items-center justify-between">
          <Button type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</Button>
          <Button variant="outline" type="button" onClick={handleGoogle}>Sign in with Google</Button>
        </div>
      </form>

      {/* --- Add date selection and available cottages display --- */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">Check Available Cottages</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={checkIn}
            onChange={e => setCheckIn(e.target.value)}
            className="px-2 py-1 border rounded"
            placeholder="Check-in"
          />
          <input
            type="date"
            value={checkOut}
            onChange={e => setCheckOut(e.target.value)}
            className="px-2 py-1 border rounded"
            placeholder="Check-out"
          />
        </div>
        {cottagesLoading && <div>Loading cottages...</div>}
        {!cottagesLoading && checkIn && checkOut && (
          <div>
            {availableCottages.length === 0 ? (
              <div>No cottages available for selected dates.</div>
            ) : (
              <ul className="space-y-2">
                {availableCottages.map(cottage => (
                  <li key={cottage.id} className="border rounded p-2">
                    <div className="font-medium">{cottage.name || cottage.title}</div>
                    <div>Capacity: {cottage.capacity}</div>
                    <div>Price per night: ₹{cottage.price_per_night}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* --- Guest Reviews Section --- */}
      <div className="mt-16">
        <div className="text-center mb-6">
          <div className="text-xs tracking-widest text-yellow-700 mb-2">GUEST EXPERIENCES</div>
          <h2 className="text-3xl font-serif font-bold mb-2">Words from Our Guests</h2>
        </div>
        {reviewsLoading ? (
          <div className="text-center">Loading reviews...</div>
        ) : (
          <div className="flex flex-col gap-6">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-lg shadow p-5 border border-gray-100"
                style={{ maxWidth: 500, margin: "0 auto" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-semibold text-lg">{r.name}</div>
                  <div className="flex items-center ml-auto">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-500 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <div className="italic text-gray-700 mb-2">"{r.review}"</div>
                <div className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
