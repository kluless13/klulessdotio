This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, set up your environment variables:

1. Create a `.env.local` file in the root directory based on `.env.local.example`
2. Add your Firebase project credentials to the `.env.local` file
3. These credentials are used for storing and retrieving messages

Then, install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Migration

To migrate your existing messages from the JSON file to Firebase:

```bash
# First, make sure you've set up your .env.local file with Firebase credentials
npm run migrate
```

## Production Deployment

For production deployment, make sure to:

1. Set up Firebase environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Run the migration script if you want to preserve existing messages
3. Deploy your application

This setup ensures your messages will persist in production environments using Firebase Firestore.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
