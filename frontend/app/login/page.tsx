'use client';

import React from 'react';
import { SSOLogin } from '@/components/auth/SSOLogin';
import { TenantSwitcher } from '@/components/tenant/TenantSwitcher';

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <SSOLogin />
      <TenantSwitcher />
    </div>
  );
} 