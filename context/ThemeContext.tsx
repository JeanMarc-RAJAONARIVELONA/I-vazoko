import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import { useUserStore } from "@/store/userStore";

type ThemeContextType = {
  theme: typeof Colors.light;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { themeMode, setThemeMode } = useUserStore();

  useEffect(() => {
    if (!themeMode) {
      setThemeMode(systemColorScheme || "light");
    }
  }, []);

  const theme = Colors[themeMode || "light"];
  const isDark = themeMode === "dark";

  const toggleTheme = () => {
    setThemeMode(themeMode === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
