[Setup]
AppName=PrayerTimesApp
AppVersion=1.0
AppPublisher=PrayerTimes


DefaultDirName={localappdata}\PrayerTimesApp
DefaultGroupName=PrayerTimesApp

OutputDir=.
OutputBaseFilename=PrayerTimesApp_Setup
SetupIconFile=Publish\PrayerTimesApp.ico

Compression=lzma
SolidCompression=yes
WizardStyle=modern


PrivilegesRequired=lowest
ArchitecturesInstallIn64BitMode=x64os

LanguageDetectionMethod=none
LicenseFile=rtf\license_en.rtf
InfoBeforeFile=rtf\readme_en.rtf


[Languages]
Name: "bulgarian"; MessagesFile: "compiler:Languages\Bulgarian.isl"; \
    LicenseFile: "rtf\license_bg.rtf"; InfoBeforeFile: "rtf\readme_bg.rtf"

Name: "english"; MessagesFile: "compiler:Default.isl"; \
    LicenseFile: "rtf\license_en.rtf"; InfoBeforeFile: "rtf\readme_en.rtf"

Name: "turkish"; MessagesFile: "compiler:Languages\Turkish.isl"; \
    LicenseFile: "rtf\license_tr.rtf"; InfoBeforeFile: "rtf\readme_tr.rtf"

Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"; \
    LicenseFile: "rtf\license_ar.rtf"; InfoBeforeFile: "rtf\readme_ar.rtf"


[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; Flags: unchecked
Name: "startup"; Description: "{cm:AutoStartProgram}"


[Files]
Source: "Publish\*"; \
    DestDir: "{app}"; \
    Flags: ignoreversion recursesubdirs createallsubdirs


[Icons]
; 👉 Start Menu (USER)
Name: "{group}\PrayerTimesApp"; \
    Filename: "{app}\Времена за Намаз.exe"; \
    IconFilename: "{app}\PrayerTimesApp.ico"

; 👉 Desktop (USER)
Name: "{userdesktop}\Времена за Намаз"; \
    Filename: "{app}\Времена за Намаз.exe"; \
    IconFilename: "{app}\PrayerTimesApp.ico"; \
    Tasks: desktopicon

; 👉 Startup (USER)
Name: "{userstartup}\PrayerTimesApp"; \
    Filename: "{app}\Времена за Намаз.exe"; \
    IconFilename: "{app}\PrayerTimesApp.ico"; \
    Tasks: startup


[Run]
Filename: "{app}\Времена за Намаз.exe"; \
    Description: "{cm:LaunchProgram,PrayerTimesApp}"; \
    Flags: nowait postinstall skipifsilent
