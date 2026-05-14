import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import VaultXCrypto from './VaultXcrypto';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <VaultXCrypto />
    </GoogleOAuthProvider>
  );
}
