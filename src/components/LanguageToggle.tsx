
"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePathname, useRouter } from 'next/navigation'; // Import hooks from next/navigation
import { locales, defaultLocale } from '@/i18n'; // Import locales and defaultLocale

// Define the type for props
interface LanguageToggleProps {
    currentLocale: string;
}

export function LanguageToggle({ currentLocale }: LanguageToggleProps) {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

    // Function to switch language
    const changeLanguage = () => {
        const nextLocale = currentLocale === 'en' ? 'hi' : 'en';
        console.log("Changing language to:", nextLocale);

        // Remove current locale prefix if it exists
        let newPath = pathname;
        const currentLocalePrefix = `/${currentLocale}`;
        if (pathname.startsWith(currentLocalePrefix)) {
            newPath = pathname.substring(currentLocalePrefix.length) || '/'; // Handle root case
        }

        // Add the new locale prefix
        const targetPath = `/${nextLocale}${newPath}`;

        router.push(targetPath); // Navigate to the new locale path

        toast({
            title: "Language Switched",
            description: `Language switched to ${nextLocale === "en" ? "English" : "Hindi"}.`,
        });
    };

  return (
    <Button variant="ghost" size="icon" onClick={changeLanguage}>
      <Languages className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}

    