// Google OAuth helper functions

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, config: { theme?: string; size?: string; text?: string }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
    document.head.appendChild(script);
  });
};

export const initializeGoogleAuth = (
  clientId: string,
  onSuccess: (idToken: string) => void,
  onError?: (error: Error) => void
): Promise<void> => {
  return loadGoogleScript()
    .then(() => {
      if (!window.google?.accounts?.id) {
        throw new Error('Google Sign-In script not loaded');
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            const error = new Error('No credential received from Google');
            if (onError) onError(error);
          }
        },
      });
    })
    .catch((error) => {
      if (onError) onError(error instanceof Error ? error : new Error('Failed to initialize Google Auth'));
      throw error;
    });
};

export const signInWithGoogle = (clientId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    loadGoogleScript()
      .then(() => {
        if (!window.google?.accounts?.id) {
          reject(new Error('Google Sign-In script not loaded'));
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              resolve(response.credential); // This is the idToken
            } else {
              reject(new Error('No credential received from Google'));
            }
          },
        });

        // Show the One Tap prompt
        window.google.accounts.id.prompt();
      })
      .catch(reject);
  });
};
