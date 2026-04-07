import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ProFranchise – Growth Accelerated',
  description: 'Engineering the blueprints of regional brand success.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
