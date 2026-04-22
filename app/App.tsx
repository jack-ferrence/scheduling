import { RouterProvider } from 'react-router';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import { router } from './router';
import { UserProvider } from './context/UserContext';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="biola-sports-theme">
      <UserProvider>
        <Toaster />
        <RouterProvider router={router} />
      </UserProvider>
    </ThemeProvider>
  );
}
