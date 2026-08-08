import { useEffect, useRef } from 'react';
import { useGoogleScript } from '../../hooks/useGoogleScript';
import { GOOGLE_CLIENT_ID } from '../../utils/constants';
import { GoogleCredentialResponse } from '../../types/google';

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
}

export function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const isScriptReady = useGoogleScript();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isScriptReady || !containerRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: GoogleCredentialResponse) => onCredential(response.credential),
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: 300,
    });
  }, [isScriptReady, onCredential]);

  if (!isScriptReady) {
    return <div className="h-11 w-[300px] animate-pulse rounded-full bg-gray-200" />;
  }

  return <div ref={containerRef} />;
}
