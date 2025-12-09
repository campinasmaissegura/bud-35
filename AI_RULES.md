# AI Rules for BUD 35 Application

This document outlines the technical stack and specific library usage guidelines for developing and maintaining the BUD 35 application. Adhering to these rules ensures consistency, maintainability, and optimal performance.

## Tech Stack Overview

The BUD 35 application is built using the following core technologies:

*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A superset of JavaScript that adds static typing, enhancing code quality and developer experience.
*   **React Router**: Used for declarative routing within the application, managing navigation between different views.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs directly in your markup.
*   **shadcn/ui**: A collection of reusable UI components built with Radix UI and styled with Tailwind CSS, providing a consistent and accessible design system.
*   **Lucide React**: A library of beautiful and customizable open-source icons for React applications.
*   **React Query (@tanstack/react-query)**: A powerful library for managing server-state, including data fetching, caching, synchronization, and updates.
*   **Vite**: A fast and opinionated build tool that provides a lightning-fast development experience.
*   **Local Storage (Mock Backend)**: Currently used for simulating backend persistence and API interactions.

## Library Usage Rules

To maintain a clean and efficient codebase, please follow these guidelines for library usage:

*   **UI Components**:
    *   **Prioritize shadcn/ui**: Always use components from `shadcn/ui` when available and suitable for the design.
    *   **Custom Components**: If a required component is not available in `shadcn/ui` or needs significant customization, create a new component in `src/components/` and style it exclusively with Tailwind CSS.
    *   **No Direct shadcn/ui Modification**: Never modify the source files of `shadcn/ui` components directly. If a change is needed, create a new component that wraps or extends the `shadcn/ui` component.
*   **Styling**:
    *   **Tailwind CSS Only**: All styling must be done using Tailwind CSS utility classes. Avoid writing custom CSS files or inline styles unless absolutely necessary for a very specific, isolated case (e.g., dynamic styles that cannot be expressed with Tailwind).
    *   **Responsive Design**: Always ensure designs are responsive using Tailwind's responsive utility classes.
*   **Routing**:
    *   **React Router DOM**: Use `react-router-dom` for all client-side routing. Define routes in `src/App.tsx` and use `createPageUrl` from `utils.ts` for navigation links.
*   **Data Management**:
    *   **React Query**: Use `@tanstack/react-query` for all asynchronous data operations (fetching, caching, mutations) that interact with the `base44Client`.
    *   **Local State**: For simple component-level state, use React's built-in `useState` or `useReducer` hooks.
*   **Icons**:
    *   **Lucide React**: All icons used in the application must come from the `lucide-react` library.
*   **Backend Interaction**:
    *   **`base44Client.ts`**: All interactions with the application's data (authentication, CRUD operations on entities, file uploads) must go through the `base44Client` service located in `src/services/base44Client.ts`. Do not directly access `localStorage` from components for data persistence.
*   **Utility Functions**:
    *   **`utils.ts`**: General utility functions (e.g., `cn` for class merging, `createPageUrl` for routing) should be placed in `src/utils.ts`.
*   **Date Formatting**:
    *   **Native `Date`**: Prefer using native JavaScript `Date` objects and `toLocaleString('pt-BR', ...)` for date and time formatting, as demonstrated in `ManageUsers.tsx` and `ViewPerson.tsx`. Avoid introducing external date libraries unless a complex, specific formatting requirement cannot be met natively.