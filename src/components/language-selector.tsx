"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { GlobeIcon } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" }
];

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Get current language from the URL
  const getCurrentLanguage = (): string => {
    const segments = pathname.split('/');
    if (segments.length > 1 && languages.some(lang => lang.code === segments[1])) {
      return segments[1];
    }
    return "en"; // Default language
  };

  const currentLang = getCurrentLanguage();

  // Calculate the new URL when language changes
  const getNewUrl = (newLang: string): string => {
    const segments = pathname.split('/');

    // If there's a language code in the URL, replace it
    if (segments.length > 1 && languages.some(lang => lang.code === segments[1])) {
      segments[1] = newLang;
      return segments.join('/');
    }

    // Otherwise, add the language code
    return `/${newLang}${pathname}`;
  };

  const handleLanguageChange = (newLang: string) => {
    const newUrl = getNewUrl(newLang);
    startTransition(() => {
      router.push(newUrl);
    });
  };

  return (
    <div className="flex items-center">
      <Select value={currentLang} onValueChange={handleLanguageChange} disabled={isPending}>
        <SelectTrigger className="w-[130px] h-9 text-sm">
          <div className="flex items-center gap-2">
            <GlobeIcon className="h-4 w-4" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="text-sm">
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
