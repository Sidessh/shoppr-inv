import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      // Send error to parent window
      if (window.opener) {
        console.log('[GoogleCallback] posting ERROR to opener', error);
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error
        }, '*');
      }
      setTimeout(() => window.close(), 150);
      return;
    }

    if (code && state) {
      // Send success data to parent window
      if (window.opener) {
        console.log('[GoogleCallback] posting SUCCESS to opener', { code, state });
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          code: code,
          state: state
        }, '*');
      }
      setTimeout(() => window.close(), 150);
    } else {
      // No code or state, send error
      if (window.opener) {
        console.log('[GoogleCallback] posting MISSING CODE/STATE to opener');
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'No authorization code received'
        }, '*');
      }
      setTimeout(() => window.close(), 150);
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
