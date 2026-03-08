import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verify = async () => {
      try {
        const response = await api.get<{ message: string }>(`/api/auth/verify?token=${token}`);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        toast.success('Email verified! You can now log in.');
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Verification failed.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-8 text-center border">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Verifying Email</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-foreground">Email Verified!</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <Button asChild className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-bold text-foreground">Verification Failed</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <div className="flex flex-col w-full gap-2">
              <Button asChild variant="outline">
                <Link to="/register">Back to Register</Link>
              </Button>
              <Button asChild>
                <Link to="/login">Try Login anyway</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
