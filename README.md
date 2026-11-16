# Split The Bill

Real-time web app for splitting group expenses.

After a group dinner or a trip, someone ends up doing the math by hand and sending it to the chat. Split The Bill turns that into one shared link: add the people and the items, assign who had what, and everyone sees the same fair split update live on their own device. There is no sign-up and no account to make.

## Features

- **One shareable link** per bill, plus a QR code for sharing in person
- **Live totals** that update on every device as items are added, removed or assigned
- **Per-person assignment**, so each participant pays only for what they had
- **Automatic item icons**, matched from keywords in each item's name
- **Light and dark themes**

## Stack

- [Next.js](https://nextjs.org) and React
- [Firebase](https://firebase.google.com) (Firestore) for real-time sync
- Tailwind CSS

## Running locally

```bash
npm install
npm run dev
```

The app reads its Firebase project from `src/lib/firebase.ts`. Point it at your own Firebase project to run your own copy.
