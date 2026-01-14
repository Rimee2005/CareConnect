import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: 'VITAL' | 'GUARDIAN';
    };
  }

  interface User {
    id: string;
    email: string;
    role: 'VITAL' | 'GUARDIAN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'VITAL' | 'GUARDIAN';
  }
}

