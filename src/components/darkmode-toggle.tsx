import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

const isDarkTheme = () => {
  const root = window.document.documentElement;
  return root.classList.contains("dark");
};

const toggleTheme = () => {
  const root = window.document.documentElement;
  const isDark = isDarkTheme();

  if (isDark) root.classList.remove("dark");
  else root.classList.add("dark");
};

const DarkModeToggle = () => {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="toggle-theme">
        {isDarkTheme() ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </Label>
      <Switch
        checked={isDarkTheme()}
        onClick={() => toggleTheme()}
        id="toggle-theme"
      />
    </div>
  );
};

export default DarkModeToggle;
