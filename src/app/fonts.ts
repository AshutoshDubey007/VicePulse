import localFont from 'next/font/local';
import { Bowlby_One, Archivo, Space_Mono } from 'next/font/google';

export const pricedown = localFont({
  src: '../fonts/pricedown.otf',
  variable: '--font-pricedown',
  display: 'swap',
});

export const bowlbyOne = Bowlby_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bowlby',
  display: 'swap',
});

export const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

export const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});
