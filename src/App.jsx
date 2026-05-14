import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import VaultXCrypto from './VaultXcrypto';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "placeholder-client-id";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <VaultXCrypto />
    </GoogleOAuthProvider>
  );
}
