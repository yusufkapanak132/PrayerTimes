[Setup]
AppName=PrayerTimesApp
AppVersion=1.0
AppPublisher=PrayerTimes
DefaultDirName={pf}\PrayerTimesApp
DefaultGroupName=PrayerTimesApp

OutputDir=.
OutputBaseFilename=PrayerTimesApp_Setup
SetupIconFile=PrayerTimesApp.ico

Compression=lzma
SolidCompression=yes
WizardStyle=modern

LicenseFile=license.rtf
InfoBeforeFile=readme.rtf

; Enable language selection
LanguageDetectionMethod=none

[Languages]
Name: "bulgarian"; MessagesFile: "compiler:Languages\Bulgarian.isl"
Name: "english";   MessagesFile: "compiler:Default.isl"
Name: "turkish";   MessagesFile: "compiler:Languages\Turkish.isl"
Name: "arabic";    MessagesFile: "compiler:Languages\Arabic.isl"

[Files]
Source: "Времена за Намаз.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "PrayerTimesApp.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "readme.rtf"; DestDir: "{app}"; Flags: ignoreversion
Source: "license.rtf"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\PrayerTimesApp"; Filename: "{app}\Времена за Намаз.exe"; IconFilename: "{app}\PrayerTimesApp.ico"
Name: "{commondesktop}\PrayerTimesApp"; Filename: "{app}\Времена за Намаз.exe"; IconFilename: "{app}\PrayerTimesApp.ico"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; Flags: unchecked
Name: "startup"; Description: "{cm:AutoStartProgram}"; Flags: unchecked

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; \
    ValueType: string; ValueName: "PrayerTimesApp"; \
    ValueData: """{app}\Времена за Намаз.exe"""; Tasks: startup

[Run]
Filename: "{app}\Времена за Намаз.exe"; Description: "{cm:LaunchProgram,PrayerTimesApp}"; Flags: nowait postinstall skipifsilent
