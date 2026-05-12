import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'Mess Management System — CST',
  description: 'Hostel Mess Management for College of Science and Technology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}