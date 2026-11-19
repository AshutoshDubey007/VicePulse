import { Metadata } from 'next';
import { AuthClient } from './AuthClient';

export const metadata: Metadata = {
  title: 'Sign In / Register | VicePulse - GTA VI Discovery Wire',
  description: 'Access your VicePulse field scout account, manage tracked discoveries, and submit intel.',
};

export default function AuthPage() {
  return <AuthClient />;
}
