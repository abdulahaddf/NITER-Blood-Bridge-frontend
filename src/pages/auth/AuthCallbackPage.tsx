import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/App';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { setSession } = useAuthContext();
  const navigate = useNavigate();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    const hasProfile = searchParams.get('hasProfile');

    if (token && refresh) {
      const handleAuth = async () => {
        try {
          await setSession(token, refresh);
          toast.success('Login successful!');
          
          // If new user (no complete profile), go to profile edit
          if (hasProfile === 'false') {
            navigate('/profile/edit', { replace: true });
            return;
          }

          // Otherwise redirect to intended page or search
          const from = localStorage.getItem('auth_redirect_from') || '/search';
          localStorage.removeItem('auth_redirect_from');
          navigate(from, { replace: true });
        } catch (error) {
          console.error('Auth callback failed:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/login', { replace: true });
        }
      };
      
      handleAuth();
    } else {
      toast.error('Invalid authentication response');
      navigate('/login', { replace: true });
    }
  }, [searchParams, setSession, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Completing login...</h2>
        <p className="text-muted-foreground">Please wait while we finalize your authentication.</p>
      </div>
    </div>
  );
}
