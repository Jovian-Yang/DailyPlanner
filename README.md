# DailyPlanner

A calm, local-first daily planner inspired by Microsoft To Do. It runs without an account, keeps tasks on the current device, and supports English and Simplified Chinese. English is the default language.

This project is open source under the [MIT License](LICENSE). Contributions and personal adaptations are welcome.

## Features

- Customizable greeting name, saved locally from **Settings**
- English / 简体中文 language switch
- My Day, Important, Planned, Completed, and custom list views
- Calendar planning for future dates
- Recurring tasks: every day, weekdays, every week, every month, or every year
- Pinning, importance, inline task details, date reassignment, delete with undo, and JSON backup
- Progress bar with a completion celebration
- Optional Windows desktop launcher using WebView2

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Build the Windows launcher

The desktop launcher starts the local planner in a standalone WebView2 window and reuses one window when opened again. Microsoft Edge WebView2 Runtime must be installed on Windows.

```powershell
dotnet publish desktop/DailyPlannerLauncher.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:IncludeAllContentForSelfExtract=true -p:DebugType=None -p:DebugSymbols=false -o "dist/Daily Planner"
```

The launcher resolves the project folder relative to the executable, so the repository can be cloned to another location without editing a hard-coded path.

## Data and privacy

Tasks, language preference, and display name are stored in browser local storage on this device. There is no login system or cloud sync. The `Back up tasks` action downloads a JSON copy when you want to move or preserve your data.
