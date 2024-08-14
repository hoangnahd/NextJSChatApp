"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

interface ProviderProps {
  children: React.ReactNode;
  session?: any; // Or use a more specific type for session
}

const Provider = ({ children, session }: ProviderProps) => {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
};

export default Provider;
