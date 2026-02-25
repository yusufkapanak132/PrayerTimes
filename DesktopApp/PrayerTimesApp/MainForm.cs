using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Speech.Synthesis;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;
using Windows.Devices.Geolocation;

namespace PrayerTimesApp
{
    public partial class MainForm : Form
    {
        private const string SETTINGS_FILE = "location_settings.txt";
        private const int BASE_WIDTH = 467;
        private const int BASE_HEIGHT = 865;

        // Добавени променливи за гласовия синтез
        private SpeechSynthesizer _speechSynthesizer;
        private Button _btnVoice;
        private bool _isSpeaking = false;

        // Базови размери за различни елементи
        private readonly Dictionary<string, RectangleF> _baseLayout = new Dictionary<string, RectangleF>
            {
                { "header", new RectangleF(0, 0, 100, 10) },
                { "countdown", new RectangleF(0, 10, 100, 18) },
                { "progress", new RectangleF(0, 28, 100, 10) },
                { "date", new RectangleF(0, 38, 100, 8) },
                { "list", new RectangleF(0, 46, 100, 48) },
                { "footer", new RectangleF(0, 94, 100, 6) }
            };

        // Базови размери на шрифтовете
        private const float BaseFontTitle = 32f;
        private const float BaseFontCity = 18f;
        private const float BaseFontDate = 20f;
        private const float BaseFontListTime = 15f;
        private const float BaseFontListText = 13f;
        private const float BaseFontSmall = 10f;
        private const float BaseFontMedium = 14f;
        private const float BaseFontLarge = 16f;

        private int _minutesBeforeNotify = 15;
        private List<CityData> _referenceCities;
        private CityData _currentLocation;
        private System.Windows.Forms.Timer _timerClock;
        private HashSet<string> _sentNotifications = new HashSet<string>();
        private Dictionary<string, Dictionary<string, PrayerTimesData>> _prayerTimesData;

        private Panel[] _rowPanels = new Panel[6];
        private Label[] _timeLabels = new Label[6];
        private Label[] _nameLabels = new Label[6];
        private Panel[] _linePanels = new Panel[6];

        private class PrayerTimeModel { public string Name; public string Key; public DateTime Time; public bool IsCurrent; public bool IsNext; }
        private List<PrayerTimeModel> _todaysPrayers = new List<PrayerTimeModel>();

        // Променливи за мащабиране
        private Size _currentClientSize;
        private float _currentScale = 1.0f;
        private bool _isFirstShow = true;
        private bool _resizePending = false;

        // Езикови настройки
        private string _currentLanguage = "bg";

        public MainForm()
        {
            InitializeComponent();
            InitializeVoiceSynthesizer();
            InitializeVoiceButton();

            // Забраняваме максимизиране
            this.MaximizeBox = false;

            // Задаваме начален размер
            this.ClientSize = new Size(BASE_WIDTH, BASE_HEIGHT);
            this.MinimumSize = new Size(350, 600);
            this.MaximumSize = new Size(800, 1200);

            // Стартираме в Tray
            this.WindowState = FormWindowState.Minimized;
            this.ShowInTaskbar = false;

            // Създаваме таблицата
            BuildPrayerTableUI();

            _referenceCities = CityRepository.GetReferenceCities();
            _timerClock = new System.Windows.Forms.Timer { Interval = 1000 };
            _timerClock.Tick += Timer_Tick;

            // Зареждаме настройките
            if (!LoadLocationFromDisk())
            {
                _currentLocation = _referenceCities.First(c => c.Name == "София");
            }

            // Прилагаме езика
            ApplyLanguage();
            CalculateAndRenderForToday();

            _timerClock.Start();
            this.Resize += MainForm_Resize;
            this.Shown += MainForm_Shown;
            this.Load += MainForm_Load;
        }

        private string GetText(string key)
        {
            return Translations.GetText(_currentLanguage, key);
        }

        private string GetTranslatedCityName(string cityKey)
        {
            return Translations.GetTranslatedCityName(_currentLanguage, cityKey);
        }

        private bool IsAutoLocation(string locationName)
        {
            return Translations.GetTranslatedCityName(_currentLanguage, locationName) == GetText("my_location");
        }

        private void InitializeVoiceSynthesizer()
        {
            try
            {
                _speechSynthesizer = new SpeechSynthesizer();
                _speechSynthesizer.SetOutputToDefaultAudioDevice();
                _speechSynthesizer.Rate = 0; // Нормална скорост
                _speechSynthesizer.Volume = 100; // Максимална сила
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Грешка при инициализация на гласовия синтезатор: {ex.Message}",
                    "Грешка", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void InitializeVoiceButton()
        {
            _btnVoice = new Button
            {
                Text = GetText("voice_button"),
                Font = new Font("Segoe UI", 16),
                ForeColor = Color.White,
                BackColor = Color.Transparent,
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand,
                Dock = DockStyle.Left,
                Width = 40
            };

            _btnVoice.FlatAppearance.BorderSize = 0;
            _btnVoice.FlatAppearance.MouseOverBackColor = Color.FromArgb(50, 50, 50);
            _btnVoice.FlatAppearance.MouseDownBackColor = Color.FromArgb(70, 70, 70);

            _btnVoice.Click += BtnVoice_Click;

      
            if (panelHeader != null)
            {
               
                panelHeader.Controls.Clear();

               
                if (lblCityName != null)
                {
                    lblCityName.Dock = DockStyle.Fill;
                    panelHeader.Controls.Add(lblCityName);
                }

                panelHeader.Controls.Add(btnLanguage);
                panelHeader.Controls.Add(btnLocation);
                panelHeader.Controls.Add(_btnVoice);
                panelHeader.Controls.Add(btnHamburger);

                // Задаваме Dock стилове
                btnLocation.Dock = DockStyle.Right;
                btnLanguage.Dock = DockStyle.Right;
                _btnVoice.Dock = DockStyle.Left;
                btnHamburger.Dock = DockStyle.Left;
            }
        }

        private void BtnVoice_Click(object sender, EventArgs e)
        {
            if (_isSpeaking)
            {
                StopVoiceAnnouncement();
                return;
            }

            AnnouncePrayerTimes();
        }

        private void AnnouncePrayerTimes()
        {
            try
            {
                if (_speechSynthesizer == null)
                {
                    InitializeVoiceSynthesizer();
                }

                if (_speechSynthesizer == null || _todaysPrayers.Count == 0)
                {
                    MessageBox.Show(GetText("prayer_time"), "Информация",
                        MessageBoxButtons.OK, MessageBoxIcon.Information);
                    return;
                }

                // Проверяваме наличен език
                if (!Translations.VoiceSettings.ContainsKey(_currentLanguage))
                {
                    MessageBox.Show($"Гласов синтез не е наличен за език: {_currentLanguage}",
                        "Грешка", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                // Спираме текущо говорене
                StopVoiceAnnouncement();

                // Задаваме езика на гласовия синтезатор
                var voiceSetting = Translations.VoiceSettings[_currentLanguage];
                try
                {
                    _speechSynthesizer.SelectVoiceByHints(voiceSetting.gender, voiceSetting.age,
                        0, new System.Globalization.CultureInfo(voiceSetting.culture));
                }
                catch
                {
                    // Ако не успеем да зададем специфичен глас, продължаваме с текущия
                }

                // Подготвяме текста за говорене
                string announcementText = PrepareAnnouncementText();

                // Променяме вида на бутона
                _isSpeaking = true;
                _btnVoice.Text = "⏹";
                _btnVoice.ForeColor = Color.Red;

                // Започваме говорене
                _speechSynthesizer.SpeakAsync(announcementText);

                // Слушаме за завършване на говоренето
                _speechSynthesizer.SpeakCompleted += SpeechSynthesizer_SpeakCompleted;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Грешка при гласово обявяване: {ex.Message}",
                    "Грешка", MessageBoxButtons.OK, MessageBoxIcon.Error);
                _isSpeaking = false;
                _btnVoice.Text = GetText("voice_button");
                _btnVoice.ForeColor = Color.White;
            }
        }

        private string PrepareAnnouncementText()
        {
            if (_todaysPrayers.Count < 6 || _currentLocation == null)
                return "";

            var nextPrayer = _todaysPrayers.FirstOrDefault(p => p.IsNext);
            var currentPrayer = _todaysPrayers.FirstOrDefault(p => p.IsCurrent);

            DateTime now = DateTime.Now;
            string remainingTime = "";

            if (nextPrayer != null)
            {
                TimeSpan remaining = nextPrayer.Time - now;
                if (remaining.TotalHours >= 1)
                {
                    remainingTime = $"{remaining.Hours} часа и {remaining.Minutes} минути";
                }
                else if (remaining.TotalMinutes >= 1)
                {
                    remainingTime = $"{remaining.Minutes} минути";
                }
                else
                {
                    remainingTime = "по-малко от минута";
                }
            }

            // Форматираме датата според езика
            CultureInfo culture = new CultureInfo(_currentLanguage == "bg" ? "bg-BG" :
                                                 _currentLanguage == "tr" ? "tr-TR" :
                                                 _currentLanguage == "ar" ? "ar-SA" : "en-US");

            string dateText = DateTime.Now.ToString("dd MMMM yyyy, dddd", culture);

            // Подготвяме списък с времената
            string[] prayerNames = new string[6];
            string[] prayerTimes = new string[6];

            for (int i = 0; i < 6; i++)
            {
                if (i < _todaysPrayers.Count)
                {
                    prayerNames[i] = _todaysPrayers[i].Name;
                    prayerTimes[i] = _todaysPrayers[i].Time.ToString("HH:mm:ss");
                }
            }

            string citySpokenName = GetTranslatedCityName(_currentLocation.Name);

            // Създаваме текста за обявяване
            string announcement = string.Format(GetText("voice_announcement"),
                citySpokenName,
                dateText,
                prayerNames[0], prayerTimes[0],
                prayerNames[1], prayerTimes[1],
                prayerNames[2], prayerTimes[2],
                prayerNames[3], prayerTimes[3],
                prayerNames[4], prayerTimes[4],
                prayerNames[5], prayerTimes[5],
                nextPrayer?.Name ?? "",
                remainingTime
            );

            return announcement;
        }

        private void SpeechSynthesizer_SpeakCompleted(object sender, SpeakCompletedEventArgs e)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action(() =>
                {
                    StopVoiceAnnouncement();
                }));
            }
            else
            {
                StopVoiceAnnouncement();
            }
        }

        private void StopVoiceAnnouncement()
        {
            try
            {
                if (_speechSynthesizer != null && _isSpeaking)
                {
                    _speechSynthesizer.SpeakAsyncCancelAll();
                    _speechSynthesizer.SpeakCompleted -= SpeechSynthesizer_SpeakCompleted;
                }
            }
            catch { }

            _isSpeaking = false;
            _btnVoice.Text = GetText("voice_button");
            _btnVoice.ForeColor = Color.White;
        }

        private void MainForm_Shown(object sender, EventArgs e)
        {
            if (this.Visible && this.WindowState != FormWindowState.Minimized)
            {
                UpdateLayout();
            }
        }

        private void MainForm_Load(object sender, EventArgs e)
        {
            _referenceCities = CityRepository.GetReferenceCities();

          
            if (!LoadLocationFromDisk())
            {
                
                _currentLocation = _referenceCities.FirstOrDefault(c => c.Name == "София");
            }

           
            ApplyLanguage();

            
            CalculateAndRenderForToday();
            UpdateUI();

           
            _timerClock.Start();
            lblCurrentTime.Visible = true;
            lblCurrentTime.BringToFront();
            lblCurrentTime.Refresh();
        }

        private void MainForm_Resize(object sender, EventArgs e)
        {
            if (this.WindowState != FormWindowState.Minimized && this.Visible)
            {
                if (!_resizePending)
                {
                    _resizePending = true;
                    this.BeginInvoke(new Action(() =>
                    {
                        UpdateLayout();
                        _resizePending = false;
                    }));
                }
            }
        }

        private void UpdateLayout()
        {
            if (this.ClientSize.Width < 100 || this.ClientSize.Height < 100)
                return;

            float scaleX = (float)this.ClientSize.Width / BASE_WIDTH;
            float scaleY = (float)this.ClientSize.Height / BASE_HEIGHT;
            _currentScale = Math.Min(scaleX, scaleY);

            if (_currentScale < 0.5f) _currentScale = 0.5f;
            if (_currentScale > 2.0f) _currentScale = 2.0f;

            _currentClientSize = this.ClientSize;

            UpdatePanelSizes();
            UpdateFonts();
            UpdateTableLayout();
            UpdateProgressBarLayout();
        }

        private void UpdatePanelSizes()
        {
            int totalHeight = this.ClientSize.Height;
            int totalWidth = this.ClientSize.Width;

            int headerHeight = Math.Max(70, (int)(totalHeight * 0.10f));
            int countdownHeight = Math.Max(120, (int)(totalHeight * 0.18f));
            int progressHeight = Math.Max(70, (int)(totalHeight * 0.10f));
            int dateHeight = Math.Max(60, (int)(totalHeight * 0.08f));
            int listHeight = Math.Max(300, (int)(totalHeight * 0.48f));
            int footerHeight = Math.Max(40, (int)(totalHeight * 0.06f));

            if (panelHeader != null)
            {
                panelHeader.Height = headerHeight;
                panelHeader.Width = totalWidth;

                if (btnHamburger != null)
                    btnHamburger.Size = new Size((int)(40 * _currentScale), headerHeight);

                if (btnLanguage != null)
                    btnLanguage.Size = new Size((int)(40 * _currentScale), headerHeight);

                if (btnLocation != null)
                    btnLocation.Size = new Size((int)(40 * _currentScale), headerHeight);

                if (_btnVoice != null)
                    _btnVoice.Size = new Size((int)(40 * _currentScale), headerHeight);

                if (lblCityName != null)
                    lblCityName.Location = new Point((int)(125 * _currentScale), 0);
            }

            if (panelCountdown != null)
            {
                panelCountdown.Height = countdownHeight;
                panelCountdown.Width = totalWidth;

                int labelHeight = countdownHeight / 3;

                if (lblCountdown != null)
                {
                    lblCountdown.Height = labelHeight;
                    lblCountdown.Top = 0;
                }

                if (lblUntil != null)
                {
                    lblUntil.Height = labelHeight;
                    lblUntil.Top = labelHeight;
                }

                if (lblNextPrayerName != null)
                {
                    lblNextPrayerName.Height = labelHeight;
                    lblNextPrayerName.Top = labelHeight * 2;
                }
            }

            if (panelElapsedWrapper != null)
            {
                panelElapsedWrapper.Height = progressHeight;
                panelElapsedWrapper.Width = totalWidth;
                panelElapsedWrapper.Padding = new Padding((int)(20 * _currentScale), (int)(10 * _currentScale), (int)(20 * _currentScale), (int)(10 * _currentScale));

                if (pnlElapsedBody != null)
                {
                    pnlElapsedBody.Width = totalWidth - panelElapsedWrapper.Padding.Horizontal;
                    pnlElapsedBody.Height = progressHeight - panelElapsedWrapper.Padding.Vertical;

                    if (lblElapsedName != null)
                        lblElapsedName.Location = new Point((int)(18 * _currentScale), (int)(10 * _currentScale));

                    if (lblElapsedTime != null)
                        lblElapsedTime.Location = new Point(pnlElapsedBody.Width - (int)(100 * _currentScale), (int)(10 * _currentScale));

                    if (pnlRedBorder != null)
                        pnlRedBorder.Width = (int)(5 * _currentScale);

                    if (pnlProgressContainer != null)
                    {
                        pnlProgressContainer.Location = new Point(pnlRedBorder.Width, pnlElapsedBody.Height - (int)(15 * _currentScale));
                        pnlProgressContainer.Width = pnlElapsedBody.Width - pnlRedBorder.Width;
                        pnlProgressContainer.Height = (int)(5 * _currentScale);
                    }
                }
            }

            if (panelDateNav != null)
            {
                panelDateNav.Height = dateHeight;
                panelDateNav.Width = totalWidth;
            }

            if (pnlListContainer != null)
            {
                pnlListContainer.Height = listHeight;
                pnlListContainer.Width = totalWidth;
            }

            if (lblCopyright != null)
            {
                lblCopyright.Height = footerHeight;
                lblCopyright.Width = totalWidth;
            }
        }

        private void UpdateProgressBarLayout()
        {
            if (pnlProgressContainer == null || pnlProgressFill == null)
                return;

            pnlProgressFill.Height = pnlProgressContainer.Height;

            var currentPrayer = _todaysPrayers.FirstOrDefault(p => p.IsCurrent);
            var nextPrayer = _todaysPrayers.FirstOrDefault(p => p.IsNext);

            if (currentPrayer != null && nextPrayer != null)
            {
                DateTime now = DateTime.Now;
                double totalSeconds = (nextPrayer.Time - currentPrayer.Time).TotalSeconds;
                double elapsedSeconds = (now - currentPrayer.Time).TotalSeconds;

                if (totalSeconds > 0)
                {
                    double percent = elapsedSeconds / totalSeconds;
                    pnlProgressFill.Width = (int)(pnlProgressContainer.Width * Math.Max(0, Math.Min(1, percent)));
                }
            }
        }

        private void UpdateFonts()
        {
            float dpiFactor = this.DeviceDpi / 96f;
            float dpiInverse = 1.0f / dpiFactor;

            float titleFontSize = Math.Max(12, BaseFontTitle * _currentScale * dpiInverse);
            float cityFontSize = Math.Max(10, BaseFontCity * _currentScale * dpiInverse);
            float dateFontSize = Math.Max(12, BaseFontDate * _currentScale * dpiInverse);
            float listTimeFontSize = Math.Max(9, BaseFontListTime * _currentScale * dpiInverse);
            float listTextFontSize = Math.Max(8, BaseFontListText * _currentScale * dpiInverse);
            float mediumFontSize = Math.Max(9, BaseFontMedium * _currentScale * dpiInverse);
            float largeFontSize = Math.Max(10, BaseFontLarge * _currentScale * dpiInverse);
            float smallFontSize = Math.Max(7, BaseFontSmall * _currentScale * dpiInverse);

            if (lblCountdown != null)
                lblCountdown.Font = new Font(lblCountdown.Font.FontFamily, titleFontSize, FontStyle.Bold);

            if (lblCityName != null)
                lblCityName.Font = new Font(lblCityName.Font.FontFamily, cityFontSize, FontStyle.Bold);

            if (lblCurrentTime != null)
                lblCurrentTime.Font = new Font(lblCurrentTime.Font.FontFamily, smallFontSize);

            if (lblDateDisplay != null)
                lblDateDisplay.Font = new Font(lblDateDisplay.Font.FontFamily, dateFontSize, FontStyle.Bold);

            if (lblNextPrayerName != null)
                lblNextPrayerName.Font = new Font(lblNextPrayerName.Font.FontFamily, largeFontSize, FontStyle.Bold);

            if (lblUntil != null)
                lblUntil.Font = new Font(lblUntil.Font.FontFamily, mediumFontSize);

            if (lblElapsedName != null)
                lblElapsedName.Font = new Font(lblElapsedName.Font.FontFamily, mediumFontSize, FontStyle.Bold);

            if (lblElapsedTime != null)
                lblElapsedTime.Font = new Font(lblElapsedTime.Font.FontFamily, mediumFontSize, FontStyle.Bold);

            if (btnHamburger != null)
                btnHamburger.Font = new Font(btnHamburger.Font.FontFamily, largeFontSize);

            if (btnLocation != null)
                btnLocation.Font = new Font(btnLocation.Font.FontFamily, largeFontSize);

            if (btnLanguage != null)
                btnLanguage.Font = new Font(btnLanguage.Font.FontFamily, largeFontSize);

            if (_btnVoice != null)
                _btnVoice.Font = new Font(_btnVoice.Font.FontFamily, largeFontSize);
        }

        private void UpdateTableLayout()
        {
            if (pnlListContainer == null || _rowPanels[0] == null)
                return;

            int listHeight = pnlListContainer.Height;
            int rowHeight = Math.Max(40, listHeight / 6);
            int minRowHeight = (int)(40 * _currentScale);
            rowHeight = Math.Max(rowHeight, minRowHeight);

            for (int i = 0; i < 6; i++)
            {
                if (_rowPanels[i] != null)
                {
                    _rowPanels[i].Height = rowHeight;

                    if (_timeLabels[i] != null)
                    {
                        using (Graphics g = _timeLabels[i].CreateGraphics())
                        {
                            SizeF textSize = g.MeasureString("23:59:59", _timeLabels[i].Font);
                            int requiredWidth = (int)textSize.Width + 15;
                            int minWidth = (int)(80 * _currentScale);
                            _timeLabels[i].Width = Math.Max(requiredWidth, minWidth);
                            _timeLabels[i].MaximumSize = new Size(requiredWidth + 20, 0);
                        }
                    }

                    if (_nameLabels[i] != null)
                    {
                        float fontSize = Math.Max(8, BaseFontListText * _currentScale);
                        FontStyle style = _nameLabels[i].Font.Style;
                        _nameLabels[i].Font = new Font(_nameLabels[i].Font.FontFamily, fontSize, style);
                        _nameLabels[i].Padding = new Padding(5, 0, _timeLabels[i].Width + 5, 0);
                    }

                    if (_timeLabels[i] != null)
                    {
                        float fontSize = Math.Max(9, BaseFontListTime * _currentScale);
                        FontStyle style = _timeLabels[i].Font.Style;
                        _timeLabels[i].Font = new Font(_timeLabels[i].Font.FontFamily, fontSize, style);
                    }
                }
            }
        }

        private void BuildPrayerTableUI()
        {
            pnlListContainer.Controls.Clear();
            pnlListContainer.AutoScroll = false;

            Panel tableContainer = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = Color.FromArgb(20, 20, 20),
                Padding = new Padding(0),
                Margin = new Padding(0)
            };

            for (int i = 0; i < 6; i++)
            {
                Panel row = new Panel
                {
                    Dock = DockStyle.Top,
                    Height = 70,
                    BackColor = Color.Transparent,
                    Padding = new Padding(0),
                    Margin = new Padding(0)
                };

                Panel line = new Panel
                {
                    Dock = DockStyle.Bottom,
                    Height = 1,
                    BackColor = Color.FromArgb(45, 45, 45),
                    Margin = new Padding(0)
                };

                Panel content = new Panel
                {
                    Dock = DockStyle.Fill,
                    BackColor = Color.Transparent,
                    Padding = new Padding((int)(15 * _currentScale), (int)(5 * _currentScale),
                                         (int)(15 * _currentScale), (int)(5 * _currentScale))
                };

                Label lblTime = new Label
                {
                    Dock = DockStyle.Right,
                    AutoSize = true,
                    TextAlign = ContentAlignment.MiddleRight,
                    Font = new Font("Segoe UI", BaseFontListTime, FontStyle.Regular),
                    ForeColor = Color.White,
                    Text = "23:59:59",
                    Margin = new Padding(0, 0, 5, 0),
                    Padding = new Padding(5, 0, 5, 0),
                    MinimumSize = new Size(80, 0)
                };

                using (Graphics g = CreateGraphics())
                {
                    SizeF textSize = g.MeasureString("23:59:59", lblTime.Font);
                    lblTime.Width = (int)textSize.Width + 10;
                }

                Label lblName = new Label
                {
                    Dock = DockStyle.Fill,
                    TextAlign = ContentAlignment.MiddleLeft,
                    Font = new Font("Segoe UI", BaseFontListText, FontStyle.Regular),
                    ForeColor = Color.LightGray,
                    Text = "Молитва",
                    Margin = new Padding(0),
                    Padding = new Padding(5, 0, 10, 0)
                };

                content.Controls.Add(lblName);
                content.Controls.Add(lblTime);

                row.Controls.Add(content);
                row.Controls.Add(line);

                _rowPanels[i] = row;
                _linePanels[i] = line;
                _timeLabels[i] = lblTime;
                _nameLabels[i] = lblName;

                tableContainer.Controls.Add(row);
            }

            for (int i = 0; i < 6; i++)
            {
                tableContainer.Controls.SetChildIndex(_rowPanels[i], 5 - i);
            }

            tableContainer.Controls.Add(new Panel { Dock = DockStyle.Top, Height = 1 });

            pnlListContainer.Controls.Add(tableContainer);
        }

        private void RefreshTableValues()
        {
            if (!this.IsHandleCreated) return;

            for (int i = 0; i < _todaysPrayers.Count; i++)
            {
                if (i >= 6) break;

                var prayer = _todaysPrayers[i];

                _nameLabels[i].Text = prayer.Name;
                _timeLabels[i].Text = prayer.Time.ToString("HH:mm:ss");

                using (Graphics g = _timeLabels[i].CreateGraphics())
                {
                    SizeF textSize = g.MeasureString(_timeLabels[i].Text, _timeLabels[i].Font);
                    int requiredWidth = (int)textSize.Width + 15;
                    int minWidth = (int)(80 * _currentScale);
                    _timeLabels[i].Width = Math.Max(requiredWidth, minWidth);
                }

                if (prayer.IsNext)
                {
                    _rowPanels[i].BackColor = Color.FromArgb(35, 50, 35);
                    _nameLabels[i].ForeColor = Color.FromArgb(86, 206, 30);
                    _timeLabels[i].ForeColor = Color.FromArgb(86, 206, 30);
                    _nameLabels[i].Font = new Font(_nameLabels[i].Font.FontFamily, _nameLabels[i].Font.Size, FontStyle.Bold);
                    _linePanels[i].BackColor = Color.FromArgb(86, 206, 30);
                }
                else if (prayer.IsCurrent)
                {
                    _rowPanels[i].BackColor = Color.FromArgb(50, 30, 30);
                    _nameLabels[i].ForeColor = Color.FromArgb(255, 89, 78);
                    _timeLabels[i].ForeColor = Color.FromArgb(255, 89, 78);
                    _nameLabels[i].Font = new Font(_nameLabels[i].Font.FontFamily, _nameLabels[i].Font.Size, FontStyle.Bold);
                    _linePanels[i].BackColor = Color.FromArgb(255, 89, 78);
                }
                else
                {
                    _rowPanels[i].BackColor = Color.Transparent;
                    _nameLabels[i].ForeColor = Color.LightGray;
                    _timeLabels[i].ForeColor = Color.White;
                    _nameLabels[i].Font = new Font(_nameLabels[i].Font.FontFamily, _nameLabels[i].Font.Size, FontStyle.Regular);
                    _linePanels[i].BackColor = Color.FromArgb(45, 45, 45);
                }
            }
        }

        private void CalculateAndRenderForToday()
        {
            try
            {
                if (_currentLocation == null)
                {
                    MessageBox.Show("Не е избрана локация. Моля, изберете град.", "Грешка",
                        MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                DateTime date = DateTime.Now;
                string dateStr = date.ToString("yyyy-MM-dd");

                if (lblDateDisplay != null)
                {
                    CultureInfo culture = new CultureInfo(_currentLanguage == "bg" ? "bg-BG" :
                                                         _currentLanguage == "tr" ? "tr-TR" :
                                                         _currentLanguage == "ar" ? "ar-SA" : "en-US");
                    lblDateDisplay.Text = date.ToString("dd.MM.yyyy (dddd)", culture);
                }

                if (_currentLocation != null && lblCityName != null)
                    lblCityName.Text = GetTranslatedCityName(_currentLocation.Name);

                var calculatedTimes = GetPrayerTimesFromData(dateStr);

                _todaysPrayers.Clear();
                string noonName = (date.DayOfWeek == DayOfWeek.Friday) ?
                    GetText("friday") : GetText("dhuhr");

                _todaysPrayers.Add(new PrayerTimeModel
                {
                    Name = GetText("fajr"),
                    Key = "Fajr",
                    Time = calculatedTimes["Fajr"]
                });
                _todaysPrayers.Add(new PrayerTimeModel
                {
                    Name = GetText("sunrise"),
                    Key = "Sunrise",
                    Time = calculatedTimes["Sunrise"]
                });
                _todaysPrayers.Add(new PrayerTimeModel
                {
                    Name = noonName,
                    Key = "Dhuhr",
                    Time = calculatedTimes["Dhuhr"]
                });
                _todaysPrayers.Add(new PrayerTimeModel
                {
                    Name = GetText("asr"),
                    Key = "Asr",
                    Time = calculatedTimes["Asr"]
                });
                _todaysPrayers.Add(new PrayerTimeModel
                {
                    Name = GetText("maghrib"),
                    Key = "Maghrib",
                    Time = calculatedTimes["Maghrib"]
                });
                _todaysPrayers.Add(new PrayerTimeModel
                {
                    Name = GetText("isha"),
                    Key = "Isha",
                    Time = calculatedTimes["Isha"]
                });

                DetermineCurrentAndNextPrayer();
                RefreshTableValues();
                UpdateUI();

                if (!_timerClock.Enabled)
                {
                    _timerClock.Start();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Грешка при изчисляване на молитвените времена: {ex.Message}",
                    "Грешка", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private Dictionary<string, DateTime> GetPrayerTimesFromData(string dateStr)
        {
            var result = new Dictionary<string, DateTime>();
            DateTime today = DateTime.Now;

            if (_prayerTimesData == null || !_prayerTimesData.ContainsKey(_currentLocation.Name) ||
                !_prayerTimesData[_currentLocation.Name].ContainsKey(dateStr))
            {
                var prayerTimes = CalculatePrayerTimesAsDateTimes(_currentLocation, DateTime.Parse(dateStr));
                return prayerTimes;
            }

            var prayerData = _prayerTimesData[_currentLocation.Name][dateStr];

            result.Add("Fajr", ParseTime(prayerData.Зора, dateStr));
            result.Add("Sunrise", ParseTime(prayerData.Изгрев, dateStr));
            result.Add("Dhuhr", ParseTime(prayerData.Обяд, dateStr));
            result.Add("Asr", ParseTime(prayerData.Следобяд, dateStr));
            result.Add("Maghrib", ParseTime(prayerData.Залез, dateStr));
            result.Add("Isha", ParseTime(prayerData.Нощ, dateStr));

            return result;
        }

        private DateTime ParseTime(string timeStr, string dateStr)
        {
            try
            {
                DateTime date = DateTime.Parse(dateStr);
                string[] parts = timeStr.Split(':');
                if (parts.Length >= 2)
                {
                    int hour = int.Parse(parts[0]);
                    int minute = int.Parse(parts[1]);

                    int second = 0;
                    if (parts.Length >= 3)
                    {
                        second = int.Parse(parts[2]);
                    }

                    return new DateTime(date.Year, date.Month, date.Day, hour, minute, second);
                }
            }
            catch
            {
            }
            DateTime today = DateTime.Today;
            return today.AddHours(12);
        }

        private void DetermineCurrentAndNextPrayer()
        {
            DateTime now = DateTime.Now;
            foreach (var p in _todaysPrayers) { p.IsCurrent = false; p.IsNext = false; }

            for (int i = 0; i < _todaysPrayers.Count; i++)
            {
                if (_todaysPrayers[i].Time > now)
                {
                    _todaysPrayers[i].IsNext = true;
                    if (i > 0) _todaysPrayers[i - 1].IsCurrent = true;
                    return;
                }
            }
            if (_todaysPrayers.Count > 0) _todaysPrayers[_todaysPrayers.Count - 1].IsCurrent = true;
        }

        private void Timer_Tick(object sender, EventArgs e)
        {
            if (this.IsHandleCreated)
            {
                CheckNotifications();
                UpdateUI();
            }
        }

        private void UpdateUI()
        {
            if (!this.IsHandleCreated || this.Disposing || this.IsDisposed) return;

            DateTime now = DateTime.Now;
            if (lblCurrentTime != null) lblCurrentTime.Text = now.ToString("HH:mm:ss");
            panelHeader.Controls.Add(lblCurrentTime);

            var nextPrayer = _todaysPrayers.FirstOrDefault(p => p.IsNext);
            var currentPrayer = _todaysPrayers.FirstOrDefault(p => p.IsCurrent);

            if (nextPrayer != null)
            {
                if (now >= nextPrayer.Time) { CalculateAndRenderForToday(); return; }

                TimeSpan remaining = nextPrayer.Time - now;
                if (lblCountdown != null) lblCountdown.Text = $"- {remaining:hh\\:mm\\:ss}";
                if (lblNextPrayerName != null) lblNextPrayerName.Text = nextPrayer.Name;

                if (currentPrayer != null)
                {
                    double totalSeconds = (nextPrayer.Time - currentPrayer.Time).TotalSeconds;
                    double elapsedSeconds = (now - currentPrayer.Time).TotalSeconds;
                    double remainingMinutes = remaining.TotalMinutes;

                    if (totalSeconds > 0 && pnlProgressFill != null && pnlProgressContainer != null)
                    {
                        double percent = elapsedSeconds / totalSeconds;
                        pnlProgressFill.Width = (int)(pnlProgressContainer.Width * Math.Max(0, Math.Min(1, percent)));
                    }

                    if (pnlProgressFill != null)
                    {
                        if (remainingMinutes < 5) pnlProgressFill.BackColor = Color.Red;
                        else if (remainingMinutes < 15) pnlProgressFill.BackColor = Color.Orange;
                        else pnlProgressFill.BackColor = Color.FromArgb(56, 176, 0);
                    }

                    if (lblElapsedName != null) lblElapsedName.Text = currentPrayer.Name;
                    if (lblElapsedTime != null) lblElapsedTime.Text = $"+ {(now - currentPrayer.Time):hh\\:mm}";
                }
            }
            else
            {
                if (lblCountdown != null) lblCountdown.Text = GetText("good_night");
                if (lblUntil != null) lblUntil.Text = "";
                if (pnlProgressFill != null && pnlProgressContainer != null) pnlProgressFill.Width = pnlProgressContainer.Width;
                if (now.Hour == 0 && now.Minute == 0 && now.Second <= 1) CalculateAndRenderForToday();
            }
        }

        private Font GetResponsiveFont(string family, float baseSize, FontStyle style = FontStyle.Regular)
        {
            float dpiFactor = this.DeviceDpi / 96f;
            float dpiInverse = 1.0f / dpiFactor;

            float newSize = baseSize * _currentScale * dpiInverse;
            float finalSize = Math.Max(baseSize * 0.7f, newSize);

            return new Font(family, finalSize, style);
        }

        private Form CreateBeautifulDialog(string title, int baseHeight)
        {
            float layoutScale = Math.Max(1f, _currentScale);

            int scaledWidth = (int)(350 * layoutScale);
            int scaledHeight = (int)(baseHeight * layoutScale);

            Form form = new Form
            {
                Text = title,
                Width = scaledWidth,
                Height = scaledHeight,
                FormBorderStyle = FormBorderStyle.None,
                StartPosition = FormStartPosition.CenterParent,
                BackColor = Color.FromArgb(32, 32, 32),
                Padding = new Padding(2),
                Icon = this.Icon
            };

            form.Paint += (s, e) => e.Graphics.DrawRectangle(new Pen(Color.FromArgb(60, 60, 60), 2), 0, 0, form.Width - 1, form.Height - 1);

            int titleBarHeight = (int)(40 * layoutScale);

            Panel titleBar = new Panel { Dock = DockStyle.Top, Height = titleBarHeight, BackColor = Color.FromArgb(40, 40, 40) };

            Label lblTitle = new Label
            {
                Text = "  " + title,
                Dock = DockStyle.Left,
                AutoSize = true,
                ForeColor = Color.White,
                Font = GetResponsiveFont("Segoe UI", 10, FontStyle.Bold),
                TextAlign = ContentAlignment.MiddleLeft
            };
            lblTitle.Padding = new Padding(0, (int)(10 * layoutScale), 0, 0);

            Label btnClose = new Label
            {
                Text = "✕",
                Dock = DockStyle.Right,
                Width = titleBarHeight,
                TextAlign = ContentAlignment.MiddleCenter,
                ForeColor = Color.Gray,
                Cursor = Cursors.Hand,
                Font = GetResponsiveFont("Arial", 12)
            };

            btnClose.Click += (s, e) => form.Close();
            btnClose.MouseEnter += (s, e) => btnClose.ForeColor = Color.Red;
            btnClose.MouseLeave += (s, e) => btnClose.ForeColor = Color.Gray;

            bool drag = false; Point startPoint = Point.Empty;
            titleBar.MouseDown += (s, e) => { drag = true; startPoint = e.Location; };
            titleBar.MouseMove += (s, e) => { if (drag) form.Location = new Point(form.Left + e.X - startPoint.X, form.Top + e.Y - startPoint.Y); };
            titleBar.MouseUp += (s, e) => drag = false;

            titleBar.Controls.Add(lblTitle);
            titleBar.Controls.Add(btnClose);
            form.Controls.Add(titleBar);

            return form;
        }

        private void SettingsToolStripMenuItem_Click(object sender, EventArgs e)
        {
            float layoutScale = Math.Max(1f, _currentScale);

            Form prompt = CreateBeautifulDialog(GetText("settings_title"), 320);
            Panel body = new Panel { Dock = DockStyle.Fill, Padding = new Padding((int)(20 * layoutScale)) };
            prompt.Controls.Add(body); body.BringToFront();

            int elementWidth = (int)(300 * layoutScale);
            int leftMargin = (int)(20 * layoutScale);

            Label lbl = new Label
            {
                Text = GetText("settings_minutes"),
                ForeColor = Color.LightGray,
                AutoSize = true,
                Top = (int)(10 * layoutScale),
                Left = leftMargin,
                Font = GetResponsiveFont("Segoe UI", 10)
            };

            NumericUpDown num = new NumericUpDown
            {
                Top = (int)(40 * layoutScale),
                Left = leftMargin,
                Width = elementWidth,
                Value = _minutesBeforeNotify,
                Minimum = 1,
                Maximum = 60,
                BackColor = Color.FromArgb(50, 50, 50),
                ForeColor = Color.White,
                Font = GetResponsiveFont("Segoe UI", 12),
                BorderStyle = BorderStyle.FixedSingle
            };

            Button btnTest = new Button
            {
                Text = GetText("settings_test"),
                Top = (int)(90 * layoutScale),
                Left = leftMargin,
                Width = elementWidth,
                Height = (int)(35 * layoutScale),
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(60, 60, 70),
                ForeColor = Color.White,
                Font = GetResponsiveFont("Segoe UI", 9)
            };
            btnTest.FlatAppearance.BorderSize = 0;
            btnTest.Click += (s, a) => {
                if (trayIcon != null && trayIcon.Visible)
                    trayIcon.ShowBalloonTip(3000, GetText("test_notification"), GetText("test_message"), ToolTipIcon.Info);
                else
                    MessageBox.Show("Tray иконата не е видима.");
            };

            Label lblInfo = new Label
            {
                Text = GetText("settings_note"),
                ForeColor = Color.Gray,
                Top = (int)(140 * layoutScale),
                Left = leftMargin,
                Width = elementWidth,
                Height = (int)(50 * layoutScale),
                Font = GetResponsiveFont("Segoe UI", 8)
            };

            Button btnSave = new Button
            {
                Text = GetText("settings_save"),
                Top = (int)(200 * layoutScale),
                Left = leftMargin,
                Width = elementWidth,
                Height = (int)(40 * layoutScale),
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(56, 176, 0),
                ForeColor = Color.Black,
                Font = GetResponsiveFont("Segoe UI", 11, FontStyle.Bold),
                DialogResult = DialogResult.OK
            };
            btnSave.FlatAppearance.BorderSize = 0;

            body.Controls.Add(lbl);
            body.Controls.Add(num);
            body.Controls.Add(btnTest);
            body.Controls.Add(lblInfo);
            body.Controls.Add(btnSave);
            prompt.AcceptButton = btnSave;

            if (prompt.ShowDialog() == DialogResult.OK)
            {
                _minutesBeforeNotify = (int)num.Value;
                SaveSettings();
                CalculateAndRenderForToday();
            }
        }

        private void AboutToolStripMenuItem_Click(object sender, EventArgs e)
        {
            float layoutScale = Math.Max(1f, _currentScale);

            Form about = CreateBeautifulDialog(GetText("about_title"), 250);
            Panel body = new Panel { Dock = DockStyle.Fill, Padding = new Padding((int)(20 * layoutScale)) };
            about.Controls.Add(body); body.BringToFront();

            Label title = new Label
            {
                Text = GetText("app_title"),
                Dock = DockStyle.Top,
                Height = (int)(50 * layoutScale),
                TextAlign = ContentAlignment.MiddleCenter,
                Font = GetResponsiveFont("Segoe UI", 16, FontStyle.Bold),
                ForeColor = Color.FromArgb(56, 176, 0)
            };

            Label sub = new Label
            {
                Text = GetText("about_version"),
                Dock = DockStyle.Top,
                Height = (int)(60 * layoutScale),
                TextAlign = ContentAlignment.TopCenter,
                ForeColor = Color.Gray,
                Font = GetResponsiveFont("Segoe UI", 10)
            };

            Button btnOk = new Button
            {
                Text = "OK",
                Dock = DockStyle.Bottom,
                Height = (int)(40 * layoutScale),
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(40, 40, 40),
                ForeColor = Color.White,
                Font = GetResponsiveFont("Segoe UI", 9)
            };
            btnOk.FlatAppearance.BorderSize = 0;
            btnOk.Click += (s, a) => about.Close();

            body.Controls.Add(sub);
            body.Controls.Add(title);
            body.Controls.Add(btnOk);
            about.ShowDialog();
        }

        private void CheckNotifications()
        {
            DateTime now = DateTime.Now;
            foreach (var prayer in _todaysPrayers)
            {
                double diff = (prayer.Time - now).TotalMinutes;
                if (diff > 0 && diff <= _minutesBeforeNotify && diff > (_minutesBeforeNotify - 1))
                {
                    string key = prayer.Key + "_pre_" + now.Day;
                    if (!_sentNotifications.Contains(key))
                    {
                        string title = GetText("reminder_title");
                        string text = "";

                        if (prayer.Key == "Fajr")
                            text = string.Format(GetText("fajr_starts"), (int)Math.Ceiling(diff));
                        else if (prayer.Key == "Sunrise")
                            text = string.Format(GetText("sunrise_starts"), (int)diff);
                        else
                            text = string.Format(GetText("prayer_starts"), prayer.Name, (int)Math.Ceiling(diff));

                        ShowNotification(text, title);
                        _sentNotifications.Add(key);
                    }
                }

                if (Math.Abs((now - prayer.Time).TotalSeconds) < 1.5)
                {
                    string key = prayer.Key + "_now_" + now.Day;
                    if (!_sentNotifications.Contains(key))
                    {
                        string title = GetText("time_title");
                        string text = "";

                        if (prayer.Key == "Fajr")
                            text = GetText("fajr_started");
                        else if (prayer.Key == "Sunrise")
                            text = GetText("sunrise_started");
                        else
                            text = string.Format(GetText("prayer_time"), prayer.Name);

                        ShowNotification(text, $"{GetText("time_title")}: {prayer.Time:HH:mm}");
                        _sentNotifications.Add(key);
                    }
                }
            }
        }

        private void ShowNotification(string t, string b) { if (trayIcon != null) trayIcon.ShowBalloonTip(5000, t, b, ToolTipIcon.Info); }

        private void BtnLocation_Click(object sender, EventArgs e)
        {
            ContextMenuStrip menu = new ContextMenuStrip
            {
                BackColor = Color.FromArgb(45, 45, 45),
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 10),
                ShowImageMargin = false,
                RenderMode = ToolStripRenderMode.Professional,
                AutoSize = false,
                Size = new Size(270, 400)
            };

            ToolStripMenuItem autoItem = new ToolStripMenuItem(GetText("auto_location"))
            {
                ForeColor = Color.FromArgb(86, 206, 30),
                BackColor = Color.FromArgb(45, 45, 45),
                ImageScaling = ToolStripItemImageScaling.None,
                AutoSize = false,
                Height = 35,
                Width = 265,
                Padding = new Padding(10, 8, 0, 8),
                TextAlign = ContentAlignment.MiddleLeft
            };

            autoItem.Click += (s, ev) =>
            {
                menu.Close();
                this.BeginInvoke((MethodInvoker)delegate { BtnAutoLocation_Click(s, ev); });
            };
            autoItem.MouseEnter += (s, ev) => autoItem.BackColor = Color.FromArgb(65, 65, 65);
            autoItem.MouseLeave += (s, ev) => autoItem.BackColor = Color.FromArgb(45, 45, 45);

            menu.Items.Add(autoItem);
            menu.Items.Add(new ToolStripSeparator { BackColor = Color.FromArgb(80, 80, 80) });

            FlowLayoutPanel cityContainer = new FlowLayoutPanel
            {
                FlowDirection = FlowDirection.TopDown,
                WrapContents = false,
                AutoScroll = true,
                BackColor = Color.FromArgb(45, 45, 45),
                Size = new Size(260, 300),
                Padding = new Padding(0),
                Margin = new Padding(0)
            };

            cityContainer.MouseEnter += (s, ev) => cityContainer.Focus();

            foreach (var city in _referenceCities)
            {
                Button btnCity = new Button
                {
                    Text = "  " + GetTranslatedCityName(city.Name),
                    ForeColor = Color.White,
                    BackColor = Color.FromArgb(45, 45, 45),
                    FlatStyle = FlatStyle.Flat,
                    TextAlign = ContentAlignment.MiddleLeft,
                    Size = new Size(235, 35),
                    Margin = new Padding(0),
                    Cursor = Cursors.Hand,
                    Font = new Font("Segoe UI", 10)
                };

                btnCity.Tag = city;
                btnCity.FlatAppearance.BorderSize = 0;
                btnCity.FlatAppearance.MouseOverBackColor = Color.FromArgb(65, 65, 65);
                btnCity.FlatAppearance.MouseDownBackColor = Color.FromArgb(86, 206, 30);

                btnCity.Click += (s, ev) =>
                {
                    menu.Close();
                    var selectedCity = (btnCity.Tag as CityData);
                    this.BeginInvoke((MethodInvoker)delegate { SetLocation(selectedCity); });
                };

                cityContainer.Controls.Add(btnCity);
            }

            ToolStripControlHost host = new ToolStripControlHost(cityContainer)
            {
                Margin = new Padding(0),
                Padding = new Padding(0),
                AutoSize = false,
                Size = new Size(260, 305)
            };

            menu.Items.Add(host);
            menu.Show(btnLocation, new Point(0, btnLocation.Height));
        }

        private void SetLocation(CityData c)
        {
            if (c == null) return;

            _currentLocation = c;
            SaveSettings();

            if (_timerClock != null)
            {
                _timerClock.Stop();
                _timerClock.Start();
            }

            CalculateAndRenderForToday();
        }

        private async void BtnAutoLocation_Click(object sender, EventArgs e)
        {
            try
            {
                string old = lblCityName.Text;
                lblCityName.Text = GetText("my_location");
                btnLocation.Enabled = false;
                btnLanguage.Enabled = false;
                if (_btnVoice != null) _btnVoice.Enabled = false;

                var accessStatus = await Geolocator.RequestAccessAsync();

                if (accessStatus == GeolocationAccessStatus.Allowed)
                {
                    var geolocator = new Geolocator { DesiredAccuracyInMeters = 50 };

                    Geoposition pos = await geolocator.GetGeopositionAsync(
                        maximumAge: TimeSpan.FromMinutes(5),
                        timeout: TimeSpan.FromSeconds(10)
                        );

                    double lat = pos.Coordinate.Point.Position.Latitude;
                    double lon = pos.Coordinate.Point.Position.Longitude;

                    lat = Math.Round(lat, 4);
                    lon = Math.Round(lon, 4);

                    var baseCity = _referenceCities
                        .OrderBy(city => Math.Abs(city.Lat - lat) + Math.Abs(city.Lng - lon))
                        .First();

                    var newCity = new CityData(
                         GetText("my_location"),
                         lat,
                         lon,
                         baseCity.WeeklyOffsets
                    );

                    SetLocation(newCity);
                    lblCityName.Text = GetText("my_location");
                }
                else
                {
                    lblCityName.Text = old;
                    MessageBox.Show("Нямате разрешение за достъп до локацията. Моля, разрешете Location Services в Windows Settings.",
                        GetText("app_title"), MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Грешка при GPS: " + ex.Message,
                    GetText("app_title"), MessageBoxButtons.OK, MessageBoxIcon.Error);
                lblCityName.Text = "...";
            }
            finally
            {
                btnLocation.Enabled = true;
                btnLanguage.Enabled = true;
                if (_btnVoice != null) _btnVoice.Enabled = true;
            }
        }

        private void SaveSettings()
        {
            try
            {
                string baseCityName = "";

                var closestCity = _referenceCities
                    .OrderBy(c => Math.Abs(c.Lat - _currentLocation.Lat) + Math.Abs(c.Lng - _currentLocation.Lng))
                    .First();

                baseCityName = closestCity.Name;

                string data =
                    $"{_currentLocation.Name}|{_currentLocation.Lat}|{_currentLocation.Lng}|{_minutesBeforeNotify}|{baseCityName}|{_currentLanguage}";
                File.WriteAllText(SETTINGS_FILE, data);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Грешка при запазване на настройките: {ex.Message}");
            }
        }

        private bool LoadLocationFromDisk()
        {
            try
            {
                if (!File.Exists(SETTINGS_FILE))
                    return false;

                string[] p = File.ReadAllText(SETTINGS_FILE).Split('|');
                if (p.Length < 3)
                    return false;

                string cityName = p[0];
                double lat = double.Parse(p[1].Replace(',', '.'), CultureInfo.InvariantCulture);
                double lng = double.Parse(p[2].Replace(',', '.'), CultureInfo.InvariantCulture);

                if (p.Length > 3)
                    _minutesBeforeNotify = int.Parse(p[3]);

                string baseCityName = p.Length > 4 ? p[4] : null;

                if (p.Length > 5)
                {
                    string savedLanguage = p[5];
                    if (Translations.Languages.ContainsKey(savedLanguage))
                    {
                        _currentLanguage = savedLanguage;
                    }
                }

                CityData baseCity = null;

                if (!string.IsNullOrEmpty(baseCityName))
                {
                    baseCity = _referenceCities
                        .FirstOrDefault(c => c.Name.Equals(baseCityName, StringComparison.OrdinalIgnoreCase));
                }

                if (baseCity == null)
                {
                    baseCity = _referenceCities
                        .OrderBy(c => Math.Abs(c.Lat - lat) + Math.Abs(c.Lng - lng))
                        .First();
                }

                _currentLocation = new CityData(
                    cityName,
                    lat,
                    lng,
                    baseCity.WeeklyOffsets
                );

                return true;
            }
            catch
            {
                _currentLanguage = "bg";
                _currentLocation = null;
                _minutesBeforeNotify = 15;
                return false;
            }
        }

        private void BtnHamburger_Click(object sender, EventArgs e)
        {
            hamburgerMenu.Show(btnHamburger, new Point(0, btnHamburger.Height));
        }

        private void BtnLanguage_Click(object sender, EventArgs e)
        {
            ContextMenuStrip menu = new ContextMenuStrip
            {
                BackColor = Color.FromArgb(45, 45, 45),
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 10),
                ShowImageMargin = false,
                RenderMode = ToolStripRenderMode.Professional,
                AutoSize = false,
                Size = new Size(200, 180)
            };

            foreach (var lang in Translations.Languages)
            {
                ToolStripMenuItem item = new ToolStripMenuItem($"{lang.Value.flag} {lang.Value.name}")
                {
                    ForeColor = _currentLanguage == lang.Key ? Color.FromArgb(86, 206, 30) : Color.White,
                    BackColor = Color.FromArgb(45, 45, 45),
                    Tag = lang.Key,
                    ImageScaling = ToolStripItemImageScaling.None,
                    AutoSize = false,
                    Height = 40,
                    Width = 195,
                    Padding = new Padding(10, 8, 0, 8),
                    TextAlign = ContentAlignment.MiddleLeft
                };

                item.Click += (s, ev) =>
                {
                    menu.Close();
                    SetLanguage(lang.Key);
                };

                item.MouseEnter += (s, ev) => item.BackColor = Color.FromArgb(65, 65, 65);
                item.MouseLeave += (s, ev) => item.BackColor = Color.FromArgb(45, 45, 45);

                menu.Items.Add(item);
            }

            menu.Show(btnLanguage, new Point(0, btnLanguage.Height));
        }

        private void SetLanguage(string langCode)
        {
            if (Translations.Languages.ContainsKey(langCode))
            {
                string oldLanguage = _currentLanguage;
                _currentLanguage = langCode;

                if (_currentLocation != null && IsAutoLocation(_currentLocation.Name))
                {
                    _currentLocation.Name = GetText("my_location");
                }

                SaveSettings();
                ApplyLanguage();

                if (_btnVoice != null)
                {
                    _btnVoice.Text = GetText("voice_button");
                }

                CalculateAndRenderForToday();
            }
        }

        private void ApplyLanguage()
        {
            try
            {
                this.Text = GetText("app_title");
                if (lblNextPrayerName != null)
                    lblNextPrayerName.Text = GetText("see_you_tomorrow");

                if (lblUntil != null)
                    lblUntil.Text = GetText("until");

                if (lblCopyright != null)
                    lblCopyright.Text = GetText("copyright");

                if (settingsToolStripMenuItem != null)
                    settingsToolStripMenuItem.Text = GetText("menu_settings");

                if (aboutToolStripMenuItem != null)
                    aboutToolStripMenuItem.Text = GetText("menu_about");

                if (exitToolStripMenuItem != null)
                    exitToolStripMenuItem.Text = GetText("menu_exit");

                if (showToolStripMenuItem != null)
                    showToolStripMenuItem.Text = GetText("tray_show");

                if (exitTrayToolStripMenuItem != null)
                    exitTrayToolStripMenuItem.Text = GetText("tray_exit");

                if (btnLanguage != null)
                    btnLanguage.Text = GetText("language_button");

                if (btnHamburger != null)
                    btnHamburger.Text = GetText("menu_button");

                if (btnLocation != null)
                    btnLocation.Text = GetText("location_button");

                if (_btnVoice != null)
                    _btnVoice.Text = GetText("voice_button");

                if (_currentLocation != null && lblCityName != null)
                {
                    lblCityName.Text = GetTranslatedCityName(_currentLocation.Name);
                }

                if (_currentLocation != null)
                {
                    CalculateAndRenderForToday();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Грешка при прилагане на езика: {ex.Message}",
                    "Грешка", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void ExitToolStripMenuItem_Click(object sender, EventArgs e) => Application.Exit();

        private int GetIsoWeekNumber(DateTime date)
        {
            return (date.DayOfYear - 1) / 7 + 1;
        }

        private PrayerTimesData CalculatePrayerTimes(CityData city, DateTime date)
        {
            double lat = city.Lat;
            double lng = city.Lng;

            double julianDate = CalculateJulianDate(date);
            double D = julianDate - 2451545.0;
            double g = 357.529 + 0.98560028 * D;
            g = NormalizeAngle(g);

            double q = 280.459 + 0.98564736 * D;
            q = NormalizeAngle(q);

            double L = q + 1.915 * Math.Sin(DegToRad(g)) + 0.020 * Math.Sin(DegToRad(2 * g));
            L = NormalizeAngle(L);

            double e = 23.439 - 0.00000036 * D;

            double declination = RadToDeg(Math.Asin(
                Math.Sin(DegToRad(e)) * Math.Sin(DegToRad(L))
            ));

            double y = Math.Tan(DegToRad(e / 2));
            y *= y;

            double sinL = Math.Sin(DegToRad(L));
            double cosL = Math.Cos(DegToRad(L));
            double sinG = Math.Sin(DegToRad(g));
            double cosG = Math.Cos(DegToRad(g));

            double eqTime = 4 * RadToDeg(
                y * Math.Sin(2 * DegToRad(L))
                - 2 * 0.0167 * sinG
                + 4 * 0.0167 * y * sinG * Math.Cos(2 * DegToRad(L))
                - 0.5 * y * y * Math.Sin(4 * DegToRad(L))
                - 1.25 * 0.0167 * 0.0167 * Math.Sin(2 * DegToRad(g))
            );

            double noon = 12.0 - (lng / 15.0) - (eqTime / 60.0);

            double[] times = new double[6];

            double fajrAngle = -18;
            double fajrHourAngle = CalculateHourAngle(lat, declination, fajrAngle);
            times[0] = noon - fajrHourAngle;

            double sunriseAngle = -0.833;
            double sunriseHourAngle = CalculateHourAngle(lat, declination, sunriseAngle);
            times[1] = noon - sunriseHourAngle;

            times[2] = noon;

            double asrAngle = CalculateAsrAngle(lat, declination);
            double asrHourAngle = CalculateHourAngle(lat, declination, asrAngle);
            times[3] = noon + asrHourAngle;

            times[4] = noon + sunriseHourAngle;

            double ishaAngle = -17;
            double ishaHourAngle = CalculateHourAngle(lat, declination, ishaAngle);
            times[5] = noon + ishaHourAngle;

            double[] adjustedTimes = ApplyOffsetsToTimes(times, city, date);

            string[] timeStrings = new string[6];
            for (int i = 0; i < 6; i++)
            {
                timeStrings[i] = SolarToLocalTimeWithSeconds(adjustedTimes[i], eqTime, date);
            }

            return new PrayerTimesData
            {
                Ден = date.Day.ToString(),
                Зора = timeStrings[0],
                Изгрев = timeStrings[1],
                Обяд = timeStrings[2],
                Следобяд = timeStrings[3],
                Залез = timeStrings[4],
                Нощ = timeStrings[5]
            };
        }

        private double[] ApplyOffsetsToTimes(double[] times, CityData city, DateTime date)
        {
            double[] adjustedTimes = new double[6];
            Array.Copy(times, adjustedTimes, 6);

            if (city.WeeklyOffsets == null || city.WeeklyOffsets.Count == 0)
                return adjustedTimes;

            int weekNumber = GetIsoWeekNumber(date);

            if (!city.WeeklyOffsets.ContainsKey(weekNumber))
                return adjustedTimes;

            var offsets = city.WeeklyOffsets[weekNumber];

            if (offsets.Length < 6)
                return adjustedTimes;

            for (int i = 0; i < 6; i++)
            {
                adjustedTimes[i] += offsets[i] / 60.0;
                while (adjustedTimes[i] < 0) adjustedTimes[i] += 24;
                while (adjustedTimes[i] >= 24) adjustedTimes[i] -= 24;
            }

            return adjustedTimes;
        }

        private double CalculateAsrAngle(double latitude, double declination)
        {
            double latRad = DegToRad(latitude);
            double decRad = DegToRad(declination);

            double shadowLength = 1;
            double tanValue = Math.Tan(Math.Abs(latRad - decRad));
            return RadToDeg(Math.Atan(1.0 / (shadowLength + tanValue)));
        }

        private double CalculateJulianDate(DateTime date)
        {
            int year = date.Year;
            int month = date.Month;
            int day = date.Day;

            if (month <= 2)
            {
                year -= 1;
                month += 12;
            }

            int A = year / 100;
            int B = 2 - A + (A / 4);

            return Math.Floor(365.25 * (year + 4716))
                   + Math.Floor(30.6001 * (month + 1))
                   + day + B - 1524.5;
        }

        private double NormalizeAngle(double angle)
        {
            angle = angle % 360;
            if (angle < 0) angle += 360;
            return angle;
        }

        private double CalculateHourAngle(double latitude, double declination, double angle)
        {
            double latRad = DegToRad(latitude);
            double decRad = DegToRad(declination);
            double angleRad = DegToRad(angle);

            double cosH = (Math.Sin(angleRad) - Math.Sin(latRad) * Math.Sin(decRad))
                          / (Math.Cos(latRad) * Math.Cos(decRad));

            if (cosH < -1) cosH = -1;
            if (cosH > 1) cosH = 1;

            double H = RadToDeg(Math.Acos(cosH));
            return H / 15.0;
        }

        private string SolarToLocalTimeWithSeconds(double solarTime, double eqTime, DateTime date)
        {
            double timeZone = GetTimeZoneOffset(date);
            double localTime = solarTime + timeZone;
            localTime = NormalizeTimeValue(localTime);

            int hours = (int)Math.Floor(localTime);
            double fractionalHours = localTime - hours;
            double minutesWithFraction = fractionalHours * 60;
            int minutes = (int)Math.Floor(minutesWithFraction);
            double secondsWithFraction = (minutesWithFraction - minutes) * 60;
            int seconds = (int)Math.Floor(secondsWithFraction);

            if (seconds >= 60)
            {
                seconds -= 60;
                minutes += 1;
            }

            if (minutes >= 60)
            {
                minutes -= 60;
                hours += 1;
                if (hours >= 24) hours -= 24;
            }

            if (seconds < 0)
            {
                seconds += 60;
                minutes -= 1;
            }

            if (minutes < 0)
            {
                minutes += 60;
                hours -= 1;
                if (hours < 0) hours += 24;
            }

            return $"{hours:D2}:{minutes:D2}:{seconds:D2}";
        }

        private double GetTimeZoneOffset(DateTime date)
        {
            double baseOffset = 2.0;

            if (IsDaylightSavingTime(date))
            {
                baseOffset = 3.0;
            }

            return baseOffset;
        }

        private bool IsDaylightSavingTime(DateTime date)
        {
            int year = date.Year;
            DateTime marchEnd = new DateTime(year, 3, 31);
            DateTime lastMarchSunday = marchEnd.AddDays(-(int)marchEnd.DayOfWeek);
            DateTime dstStart = new DateTime(year, 3, lastMarchSunday.Day, 3, 0, 0);

            DateTime octoberEnd = new DateTime(year, 10, 31);
            DateTime lastOctoberSunday = octoberEnd.AddDays(-(int)octoberEnd.DayOfWeek);
            DateTime dstEnd = new DateTime(year, 10, lastOctoberSunday.Day, 3, 0, 0);

            DateTime dateStartOfDay = date.Date;
            DateTime dstStartDate = dstStart.Date;
            DateTime dstEndDate = dstEnd.Date;

            if (dateStartOfDay >= dstStartDate && dateStartOfDay < dstEndDate)
            {
                return true;
            }

            return false;
        }

        private double DegToRad(double degrees) => degrees * Math.PI / 180.0;
        private double RadToDeg(double radians) => radians * 180.0 / Math.PI;
        private double NormalizeTimeValue(double time)
        {
            time = time % 24;
            if (time < 0) time += 24;
            return time;
        }

        private Dictionary<string, DateTime> CalculatePrayerTimesAsDateTimes(CityData city, DateTime date)
        {
            var result = new Dictionary<string, DateTime>();
            var prayerTimes = CalculatePrayerTimes(city, date);

            result.Add("Fajr", ParseTime(prayerTimes.Зора, date.ToString("yyyy-MM-dd")));
            result.Add("Sunrise", ParseTime(prayerTimes.Изгрев, date.ToString("yyyy-MM-dd")));
            result.Add("Dhuhr", ParseTime(prayerTimes.Обяд, date.ToString("yyyy-MM-dd")));
            result.Add("Asr", ParseTime(prayerTimes.Следобяд, date.ToString("yyyy-MM-dd")));
            result.Add("Maghrib", ParseTime(prayerTimes.Залез, date.ToString("yyyy-MM-dd")));
            result.Add("Isha", ParseTime(prayerTimes.Нощ, date.ToString("yyyy-MM-dd")));

            return result;
        }

        private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true;
                Hide();
            }
        }

        private void TrayIcon_DoubleClick(object sender, EventArgs e)
        {
            RestoreWindow();
        }

        private void ShowToolStripMenuItem_Click(object sender, EventArgs e)
        {
            RestoreWindow();
        }

        private void RestoreWindow()
        {
            this.Show();
            this.WindowState = FormWindowState.Normal;
            this.Activate();

            this.BeginInvoke((MethodInvoker)delegate
            {
                float dpiScale = this.DeviceDpi / 96f;
                int targetWidth = (int)(BASE_WIDTH * dpiScale);
                int targetHeight = (int)(BASE_HEIGHT * dpiScale);

                Screen currentScreen = Screen.FromControl(this);
                int maxWidth = (int)(currentScreen.WorkingArea.Width * 0.8);
                int maxHeight = (int)(currentScreen.WorkingArea.Height * 0.8);

                if (targetWidth > maxWidth) targetWidth = maxWidth;
                if (targetHeight > maxHeight) targetHeight = maxHeight;

                targetWidth = Math.Max(targetWidth, 350);
                targetHeight = Math.Max(targetHeight, 600);

                this.ClientSize = new Size(targetWidth, targetHeight);
                this.CenterToScreen();

                UpdateLayout();
                this.Refresh();
            });
        }

        private void ExitTrayToolStripMenuItem_Click(object sender, EventArgs e)
        {
            trayIcon.Visible = false;
            Application.Exit();
        }
    }

    public class PrayerTimesData
    {
        public string Ден { get; set; }
        public string Зора { get; set; }
        public string Изгрев { get; set; }
        public string Обяд { get; set; }
        public string Следобяд { get; set; }
        public string Залез { get; set; }
        public string Нощ { get; set; }
    }
}