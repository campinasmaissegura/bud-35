import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createPageUrl = (page: string) => {
  const routes: Record<string, string> = {
    'RegisterPerson': '/register',
    'Search': '/search',
    'ManageUsers': '/manage-users',
    'ViewPerson': '/person',
    'EditPerson': '/edit-person',
    'Dashboard': '/',
    'Targets': '/targets',
    'Reports': '/reports',
  };
  
  const [base, query] = page.split('?');
  const route = routes[base] || '/';
  
  if ((base === 'ViewPerson' || base === 'EditPerson') && query) {
    // Keep query params for ViewPerson and EditPerson
    return `${route}?${query}`;
  }
  
  return route;
};