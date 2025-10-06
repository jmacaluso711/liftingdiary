# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application built with React 19, TypeScript, and Tailwind CSS v4. The project uses Turbopack for faster builds and development. It appears to be a lifting diary course application based on the repository name.

## Technology Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **React**: 19.1.0
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Build Tool**: Turbopack (enabled via `--turbopack` flag)
- **Linting**: ESLint with next/core-web-vitals and next/typescript configs

## Common Commands

### Development
```bash
npm run dev        # Start development server with Turbopack
```
The dev server runs on http://localhost:3000

### Build & Production
```bash
npm run build      # Production build with Turbopack
npm start          # Start production server
```

### Code Quality
```bash
npm run lint       # Run ESLint
```

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with Geist fonts configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global styles with Tailwind directives
  - `favicon.ico` - Site favicon
- `public/` - Static assets (SVGs, images)

### TypeScript Configuration
- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Target: ES2017

### Styling
- Tailwind CSS v4 configured via PostCSS
- Geist Sans and Geist Mono fonts loaded via next/font/google
- Font variables: `--font-geist-sans` and `--font-geist-mono`

## Key Features

- **App Router**: Uses Next.js 15 App Router (file-based routing in `src/app/`)
- **Optimized Fonts**: Automatic font optimization with next/font
- **Turbopack**: Fast refresh and builds enabled by default
