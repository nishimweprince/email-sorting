import { authApi } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = authApi.getGoogleAuthUrl();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-primary-50 p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-lg border border-primary-200 bg-white">
        <CardHeader className="text-center space-y-4 p-6 sm:p-8">
          <figure className="flex justify-center mb-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-600 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </figure>
          <CardTitle className="text-3xl sm:text-4xl font-bold text-primary-700">
            AI Email Sorting
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-primary-600 leading-relaxed">
            Automatically categorize and summarize your emails with the power of AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 p-6 sm:p-8 pt-0">
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-primary-50 text-primary-700 border border-primary-300 hover:border-primary-400 text-sm sm:text-base font-semibold py-2 px-4"
            size="lg"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          <section className="pt-2">
            <p className="text-xs sm:text-sm text-center text-primary-600 mb-3">
              Connect your Gmail account to get started
            </p>
            <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-2 list-none">
              <li className="flex items-center gap-2 text-xs sm:text-sm text-primary-600">
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>AI Powered</span>
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm text-primary-600">
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure</span>
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm text-primary-600">
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Easy to Use</span>
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
