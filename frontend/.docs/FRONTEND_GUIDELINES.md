# Frontend Development Guidelines

This document provides comprehensive guidelines and instructions for working with the GGWP frontend project, with emphasis on using **shadcn/ui** and **Aceternity UI** libraries.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Tailwind CSS](#tailwind-css)
3. [shadcn/ui](#shadcnui)
4. [Aceternity UI](#aceternity-ui)
5. [Best Practices](#best-practices)
6. [Common Patterns](#common-patterns)

---

## Project Setup

### Quick Start

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Build for production
npm build

# Start production server
npm start
```

The dev server runs at `http://localhost:3000`

### Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # React components (UI components, features, etc.)
│   │   └── ui/          # shadcn/ui components (auto-generated)
│   ├── lib/             # Utility functions and helpers
│   ├── styles/          # Custom CSS styles
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── components.json      # shadcn/ui configuration
├── next.config.ts       # Next.js configuration
└── package.json         # Dependencies and scripts
```

---

## Tailwind CSS

Tailwind CSS v4 is pre-configured and ready to use. It provides utility-first CSS styling.

### Key Features

- **Utility-first CSS** - Use predefined classes like `flex`, `justify-center`, `bg-blue-500`, etc.
- **Responsive Design** - Mobile-first breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Dark Mode** - Built-in dark mode support with `dark:` prefix
- **Custom Configuration** - Extend/customize in `tailwind.config.ts`

### Common Tailwind Classes

```tsx
// Layout
<div className="flex items-center justify-between gap-4">

// Spacing
<div className="p-4 m-2">

// Colors
<div className="bg-blue-500 text-white">

// Responsive
<div className="text-sm md:text-lg lg:text-xl">

// Dark mode
<div className="bg-white dark:bg-slate-950">
```

### Documentation

- **Official Docs**: https://tailwindcss.com/docs
- **Tailwind v4 Guide**: https://tailwindcss.com/blog/tailwindcss-v4

---

## shadcn/ui

**shadcn/ui** provides pre-built, customizable components built with React and Tailwind CSS. All components are TypeScript-ready and come with accessibility features.

### Adding Components

To add a new shadcn/ui component:

```bash
# From the frontend directory
npx shadcn@latest add <component-name>

# Examples:
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

### Available Components

Some commonly used shadcn/ui components:

- **UI Elements**: `button`, `input`, `label`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`
- **Display**: `card`, `badge`, `alert`, `progress`, `skeleton`, `table`
- **Feedback**: `toast`, `popover`, `tooltip`, `dialog`, `alert-dialog`
- **Navigation**: `tabs`, `accordion`, `pagination`, `breadcrumb`
- **Forms**: `form` (with react-hook-form integration)

### Using shadcn/ui Components

```tsx
// Import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Example Usage
export default function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter your name..." />
        <Button className="mt-4">Submit</Button>
      </CardContent>
    </Card>
  );
}
```

### Customization

shadcn/ui components are fully customizable. The component files are located in `src/components/ui/`. You can:

1. **Modify styles** - Update the component file directly
2. **Extend functionality** - Add props or logic as needed
3. **Use CSS variables** - Tailwind uses CSS variables for theming

### Component Documentation

- **Official Docs**: https://ui.shadcn.com/
- **Component Examples**: https://ui.shadcn.com/docs/components/
- **Installation Guide**: https://ui.shadcn.com/docs/installation/next

---

## Aceternity UI

**Aceternity UI** is a collection of beautifully designed, animated components built with React and Framer Motion. It provides premium-looking animations and effects for modern web applications.

### Key Features

- **Smooth Animations** - Built with Framer Motion for fluid motion
- **Ready-to-Use** - Copy-paste components with minimal setup
- **Customizable** - All components are fully customizable
- **Performance Optimized** - Lightweight and optimized for web

### Installation

Aceternity UI is already installed via npm:

```json
{
  "aceternity-ui": "^0.2.2",
  "framer-motion": "^12.40.0"
}
```

### Available Components

Aceternity UI provides a wide range of components. Visit their website for the full list:

- **Hero Sections**: `HeroHighlight`, `TypewriterEffect`, `TextReveal`
- **Cards**: `AnimatedCard`, `HoverCard`, `GlowCard`
- **Buttons**: `ShimmerButton`, `BoundingBox`, `MagicButton`
- **Backgrounds**: `GradientBg`, `StarBackground`, `MovingBorder`
- **Text Effects**: `FlipWords`, `InlineRoll`, `WavyText`
- **Layout**: `FloatingNav`, `Spotlight`, `MacbookScroll`
- **Forms**: `PlaceholdersAndVanishInput`, `MultiStepLoader`

### Using Aceternity Components

```tsx
// Import from aceternity-ui
import { ShimmerButton } from "@/components/aceternity/shimmer-button";
import { HeroHighlight, Highlight } from "@/components/aceternity/hero-highlight";
import { TypewriterEffect } from "@/components/aceternity/typewriter-effect";

// Example Usage
export default function HeroSection() {
  const words = [
    { text: "Build" },
    { text: "awesome" },
    { text: "products" },
  ];

  return (
    <HeroHighlight>
      <TypewriterEffect words={words} />
      <ShimmerButton>Get Started</ShimmerButton>
    </HeroHighlight>
  );
}
```

### Framer Motion Integration

Aceternity components use **Framer Motion** for animations. You can also use Framer Motion directly for custom animations:

```tsx
import { motion } from "framer-motion";

export default function AnimatedBox() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-blue-500 text-white rounded"
    >
      Animated Box
    </motion.div>
  );
}
```

### Component Examples

**Example 1: Hero Section with Typography**

```tsx
import { HeroHighlight, Highlight } from "@/components/aceternity/hero-highlight";
import { ShimmerButton } from "@/components/aceternity/shimmer-button";

export default function Hero() {
  return (
    <HeroHighlight>
      <h1 className="text-4xl font-bold">
        Welcome to <Highlight>GGWP</Highlight>
      </h1>
      <p className="mt-4 text-gray-600">Build amazing gaming experiences</p>
      <ShimmerButton className="mt-6">Start Now</ShimmerButton>
    </HeroHighlight>
  );
}
```

**Example 2: Animated Card List**

```tsx
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CardList() {
  const cards = [
    { id: 1, title: "Feature 1", description: "Description here" },
    { id: 2, title: "Feature 2", description: "Description here" },
    { id: 3, title: "Feature 3", description: "Description here" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {cards.map((card) => (
        <motion.div key={card.id} variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>{card.description}</CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Documentation & Resources

- **Aceternity UI Official**: https://aceternity.com/
- **Framer Motion Docs**: https://www.framer.com/motion/
- **Component Gallery**: https://aceternity.com/components

---

## Best Practices

### 1. Component Organization

```
src/components/
├── ui/                    # shadcn/ui components
├── features/              # Feature-specific components
│   ├── auth/
│   ├── dashboard/
│   └── products/
├── layouts/               # Layout components
└── common/                # Reusable utility components
```

### 2. TypeScript Usage

Always use TypeScript for type safety:

```tsx
interface CardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export function MyCard({ title, description, onClick }: CardProps) {
  return (
    <Card onClick={onClick}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{description}</CardContent>
    </Card>
  );
}
```

### 3. Responsive Design

Always design mobile-first and use Tailwind breakpoints:

```tsx
export function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Content */}
    </div>
  );
}
```

### 4. Accessibility

- Use semantic HTML tags
- Include `aria-label` attributes when needed
- Ensure sufficient color contrast
- Test keyboard navigation
- shadcn/ui components are accessible by default

### 5. Performance

- Use `next/dynamic` for code splitting
- Lazy load images with `next/image`
- Avoid unnecessary re-renders with React.memo for expensive components
- Use Framer Motion's `will-change` carefully

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <div>Loading...</div>,
});
```

### 6. CSS Variables & Theming

Tailwind uses CSS variables in `globals.css`. Customize colors in `tailwind.config.ts`:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
      },
    },
  },
};
```

---

## Common Patterns

### Form with shadcn/ui

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
}
```

### Modal/Dialog Component

```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to proceed?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Dark Mode Toggle

Tailwind v4 supports dark mode. Add toggle functionality:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <Button onClick={toggleDarkMode} variant="outline">
      {isDark ? "Light Mode" : "Dark Mode"}
    </Button>
  );
}
```

### Animated Container

```tsx
"use client";

import { motion } from "framer-motion";

interface AnimatedContainerProps {
  children: React.ReactNode;
  delay?: number;
}

export function AnimatedContainer({
  children,
  delay = 0,
}: AnimatedContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Tips & Tricks

### Use className Utilities

For combining Tailwind classes dynamically, use `clsx` (already installed):

```tsx
import { clsx } from "clsx";

export function Button({ variant = "default" }: { variant?: string }) {
  return (
    <button
      className={clsx(
        "px-4 py-2 rounded transition",
        {
          "bg-blue-500 text-white": variant === "default",
          "bg-gray-200 text-gray-800": variant === "secondary",
        }
      )}
    >
      Click me
    </button>
  );
}
```

### Import Aliases

Use `@` alias for cleaner imports:

```tsx
// Good
import { Button } from "@/components/ui/button";
import { getUserData } from "@/lib/api";

// Avoid
import { Button } from "../../../../components/ui/button";
import { getUserData } from "../../../../lib/api";
```

### Component Documentation

Document your components with JSDoc:

```tsx
/**
 * Card component for displaying content
 * @param title - The card title
 * @param description - The card description
 * @param onClick - Callback when card is clicked
 */
export function MyCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick?: () => void;
}) {
  // Implementation
}
```

---

## Troubleshooting

### Component Not Found

If a shadcn component isn't found:

```bash
# Add the component
npx shadcn@latest add <component-name>

# Verify it exists in src/components/ui/
```

### Styling Issues

- Check Tailwind config is loaded
- Verify CSS file imports in layout
- Use `!important` sparingly for overrides
- Check for CSS conflicts in globals.css

### Animation Performance

- Use GPU-accelerated properties (`transform`, `opacity`)
- Avoid animating layout properties (width, height)
- Use `will-change` for expensive animations
- Test on lower-end devices

---

## Resources

- **Next.js 16 Docs**: https://nextjs.org/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **Aceternity UI**: https://aceternity.com/
- **Framer Motion**: https://www.framer.com/motion/
- **React Documentation**: https://react.dev/

---

## Quick Commands

```bash
# Development
npm run dev          # Start dev server

# Building
npm run build        # Build for production
npm run start        # Run production build

# Linting
npm run lint         # Run ESLint

# Add Components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card

# Help
npx shadcn@latest --help
```

---

**Last Updated**: 2026-06-07

For more information, refer to the official documentation of each library linked above.
