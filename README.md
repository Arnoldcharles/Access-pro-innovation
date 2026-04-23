# AccessPro

AccessPro is a Next.js event management site that lets organizations create branded event pages, design invites, and enable RSVP flows with QR-driven interactions.

## Key Features

- Organization and event routing via dynamic App Router paths (`/[org]/[event]`).
- Invite design editor with image upload, draggable QR positioning, and guest name placement.
- Optional RSVP design panel that expands when enabled, with its own image, QR code, and text styling.
- Firestore-backed storage for event design settings and RSVP layout data.
- Reusable UI components for navigation, onboarding, and event workflows.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start the local dev server:

```bash
npm run dev
```

3. Open the app:

```text
http://localhost:3000
```

## Available Scripts

- `npm run dev` — start the Next.js development server.
- `npm run build` — build the production application.
- `npm run start` — run the built app locally.
- `npm run lint` — run code linting (if configured).

## Environment Variables

The app uses Firebase for database access. Add your Firebase credentials to environment variables or a `.env.local` file. Common variables include:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Check `src/lib/firebase.ts` for the exact client setup.

## Project Structure

- `src/app/` — Next.js App Router entry points and nested route pages.
- `src/app/[org]/[event]/page.tsx` — event landing page.
- `src/app/[org]/[event]/design/page.tsx` — invite design editor and RSVP design toggle.
- `src/app/[org]/[event]/invite/` — invite and RSVP pages.
- `src/components/` — shared UI and layout components.
- `src/lib/firebase.ts` — Firebase client initialization.
- `src/lib/firebaseAdmin.ts` — Firebase admin utilities.

## Design Editor Behavior

- The invite design page loads event metadata and saved layout values from Firestore.
- Users can upload an event image and drag the QR code or name label into position.
- The RSVP section appears only after the user enables it using the toggle.
- RSVP design has separate image upload, QR size, text styling, and drag positioning.
- Saving the design writes both invite and RSVP layout values back to Firestore.

## Usage Notes

- Create an organization and event route to access the editor.
- Use the design editor to customize invite visuals before sharing.
- Enable RSVP when you want a dedicated RSVP card with its own layout.
- The RSVP card is optional and does not display unless enabled.

## Troubleshooting

- If images do not upload, confirm the browser can read local files and that Firebase is configured.
- If navigation or route resolution fails, verify the `org` and `event` dynamic route values are valid.
- If Firestore writes fail, check your Firebase project permissions and environment variables.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)

## Notes

This README is intentionally focused on the AccessPro app structure, local development, and the core invite/RSVP design workflow. Keep it updated as new event features are added or the Firebase integration changes.
