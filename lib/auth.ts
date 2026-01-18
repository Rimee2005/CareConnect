import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './db';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await user.comparePassword(credentials.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      // Ensure role persists across token refreshes
      // If role is missing, it means the token was created before role was added
      // In that case, we should still have it from the initial user object
      if (!token.role && user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        // Ensure role is set from token - if token doesn't have role, it's a problem
        session.user.role = token.role as 'VITAL' | 'GUARDIAN';
        session.user.email = token.email as string;
      }
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Session Callback]', {
          hasSession: !!session,
          hasUser: !!session.user,
          userId: session.user?.id,
          userRole: session.user?.role,
          tokenRole: token.role,
          tokenId: token.id,
          tokenKeys: Object.keys(token),
        });
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If redirecting to home page or auth pages, redirect to dashboard based on role
      // This will be handled by checking the session in the login/register pages
      // For now, allow the default behavior but we'll override in pages
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? undefined : undefined, // Let browser set domain
      },
    },
  },
};

