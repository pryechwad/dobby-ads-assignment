import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const TEMPLATES = [
  {
    id: 'default',
    name: 'Default',
    desc: 'General purpose workspace',
    accent: 'indigo',
    folders: [],
  },
  {
    id: 'startup',
    name: 'Startup',
    desc: 'Pitch decks, brand assets, investor docs',
    accent: 'violet',
    folders: ['Pitch Deck', 'Brand Assets', 'Investor Docs', 'Product Screenshots'],
  },
  {
    id: 'agency',
    name: 'Agency',
    desc: 'Client projects, campaigns, deliverables',
    accent: 'blue',
    folders: ['Clients', 'Campaigns', 'Deliverables', 'Stock Assets'],
  },
  {
    id: 'personal',
    name: 'Personal',
    desc: 'Photos, documents, personal projects',
    accent: 'emerald',
    folders: ['Photos', 'Documents', 'Projects', 'Archive'],
  },
];

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [template, setTemplate] = useState(() => localStorage.getItem('template') || 'default');

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('template', template);
  }, [template]);

  return (
    <ThemeContext.Provider value={{ dark, setDark, template, setTemplate }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
