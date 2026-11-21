# Parking Spot Saver

**Live demo:** https://parking-spot-saver.vercel.app/

## Description

Parking Spot Saver (installable as **Park Saver**) is a mobile-friendly web app that helps you remember where you parked at the mall. Save your spot in about 10 seconds, track how long you've been parked, and find your way back to your car when you're done shopping.

## Features

- **Quick save** – Record your parking spot in about 10 seconds. The parking level is the only required field.
- **Find my car** – A dedicated page showing your saved spot so you can walk back to your car.
- **Parking time tracking** – See how long your car has been parked.
- **History** – Keeps your last 20 parking spots, stored locally on your phone.
- **Mobile-first / installable** – Works as a web app on your phone's home screen (PWA-style meta tags for iOS and Android).
- **Light and dark mode** – Adapts to your device's color scheme.

### Pages

| Page    | Route      | Purpose                               |
| ------- | ---------- | ------------------------------------- |
| Home    | `/`        | Overview and quick access             |
| Save    | `/save`    | Save where you parked                 |
| My car  | `/car`     | Find your car and view parking time   |
| History | `/history` | View your last 20 saved parking spots |

## Tech Stack

- [Next.js](https://nextjs.org/) (React framework)
- [Vercel](https://vercel.com/) for hosting
- Browser local storage for saving data on the device

## Requirements

- [Node.js](https://nodejs.org/) v18.17 or later
- npm (comes with Node.js), or yarn / pnpm
- [Git](https://git-scm.com/)
- A modern web browser (Chrome, Safari, Edge, or Firefox)

## How to Install and Run

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd parking-spot-saver
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open the app** in your browser at [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

### Use it on your phone

Open the [live demo](https://parking-spot-saver.vercel.app/) on your phone, then choose **Add to Home Screen** from your browser menu to install it like an app.

## Author

- **Name:** Andrea Lorraine F. Buen
- **Section:** BSINTE2C
