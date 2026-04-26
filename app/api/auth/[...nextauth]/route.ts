import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// In-memory user store (in production, use a database)
const users = [
  {
    id: '1',
    email: 'admin@insightflow.com',
    password: 'admin123', // In production, hash passwords
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: '2',
    email: 'user@insightflow.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user'
  }
];

const config = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = users.find(
          u => u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);

export const { GET, POST } = handlers;