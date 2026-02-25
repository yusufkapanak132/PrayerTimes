namespace PrayerTimesApp
{
    partial class MainForm
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null)) components.Dispose();
            base.Dispose(disposing);
            if (disposing)
            {
                if (_speechSynthesizer != null)
                {
                    StopVoiceAnnouncement();
                    _speechSynthesizer.Dispose();
                }
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        private void InitializeComponent()
        {
            components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(MainForm));
            mainContainer = new TableLayoutPanel();
            panelHeader = new Panel();
            lblCityName = new Label();
            lblCurrentTime = new Label();
            btnLocation = new Button();
            btnHamburger = new Button();
            btnLanguage = new Button();
            panelCountdown = new Panel();
            lblNextPrayerName = new Label();
            lblUntil = new Label();
            lblCountdown = new Label();
            panelElapsedWrapper = new Panel();
            pnlElapsedBody = new Panel();
            pnlProgressContainer = new Panel();
            pnlProgressFill = new Panel();
            lblElapsedTime = new Label();
            lblElapsedName = new Label();
            pnlRedBorder = new Panel();
            panelDateNav = new Panel();
            lblDateDisplay = new Label();
            pnlListContainer = new Panel();
            lblCopyright = new Label();
            hamburgerMenu = new ContextMenuStrip(components);
            settingsToolStripMenuItem = new ToolStripMenuItem();
            aboutToolStripMenuItem = new ToolStripMenuItem();
           
            toolStripSeparator1 = new ToolStripSeparator();
            exitToolStripMenuItem = new ToolStripMenuItem();
            trayIcon = new NotifyIcon(components);
            trayMenu = new ContextMenuStrip(components);
            showToolStripMenuItem = new ToolStripMenuItem();
            toolStripSeparator2 = new ToolStripSeparator();
            exitTrayToolStripMenuItem = new ToolStripMenuItem();
            mainContainer.SuspendLayout();
            panelHeader.SuspendLayout();
            panelCountdown.SuspendLayout();
            panelElapsedWrapper.SuspendLayout();
            pnlElapsedBody.SuspendLayout();
            pnlProgressContainer.SuspendLayout();
            panelDateNav.SuspendLayout();
            hamburgerMenu.SuspendLayout();
            trayMenu.SuspendLayout();
            SuspendLayout();
            // 
            // mainContainer
            // 
            mainContainer.BackColor = Color.FromArgb(26, 26, 26);
            mainContainer.ColumnCount = 1;
            mainContainer.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
            mainContainer.Controls.Add(panelHeader, 0, 0);
            mainContainer.Controls.Add(panelCountdown, 0, 1);
            mainContainer.Controls.Add(panelElapsedWrapper, 0, 2);
            mainContainer.Controls.Add(panelDateNav, 0, 3);
            mainContainer.Controls.Add(pnlListContainer, 0, 4);
            mainContainer.Controls.Add(lblCopyright, 0, 5);
            mainContainer.Dock = DockStyle.Fill;
            mainContainer.Location = new Point(0, 0);
            mainContainer.Margin = new Padding(0);
            mainContainer.Name = "mainContainer";
            mainContainer.RowCount = 6;
            mainContainer.RowStyles.Add(new RowStyle(SizeType.Percent, 10F));
            mainContainer.RowStyles.Add(new RowStyle(SizeType.Percent, 18F));
            mainContainer.RowStyles.Add(new RowStyle(SizeType.Percent, 10F));
            mainContainer.RowStyles.Add(new RowStyle(SizeType.Percent, 8F));
            mainContainer.RowStyles.Add(new RowStyle(SizeType.Percent, 48F));
            mainContainer.RowStyles.Add(new RowStyle(SizeType.Percent, 6F));
            mainContainer.Size = new Size(467, 865);
            mainContainer.TabIndex = 0;
            // 
            // panelHeader
            // 
            panelHeader.BackColor = Color.FromArgb(32, 32, 32);
            panelHeader.Controls.Add(lblCityName);
            panelHeader.Controls.Add(lblCurrentTime);
            panelHeader.Controls.Add(btnLocation);
            panelHeader.Controls.Add(btnLanguage);
            panelHeader.Controls.Add(btnHamburger);
            panelHeader.Dock = DockStyle.Fill;
            panelHeader.Location = new Point(0, 0);
            panelHeader.Margin = new Padding(0);
            panelHeader.Name = "panelHeader";
            panelHeader.Size = new Size(467, 86);
            panelHeader.TabIndex = 0;
            // 
            // lblCityName
            // 
            lblCityName.Dock = DockStyle.Fill;
            lblCityName.Font = new Font("Segoe UI", 18F, FontStyle.Bold, GraphicsUnit.Point, 0);
            lblCityName.ForeColor = Color.White;
            lblCityName.Location = new Point(50, 0);
            lblCityName.Name = "lblCityName";
            lblCityName.Size = new Size(367, 60);
            lblCityName.TabIndex = 2;
            lblCityName.Text = "София";
            lblCityName.TextAlign = ContentAlignment.MiddleCenter;
            // 
            // lblCurrentTime
            // 
            lblCurrentTime.Dock = DockStyle.Bottom;
            lblCurrentTime.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point, 0);
            lblCurrentTime.ForeColor = Color.FromArgb(200, 200, 200);
            lblCurrentTime.Location = new Point(50, 60);
            lblCurrentTime.Name = "lblCurrentTime";
            lblCurrentTime.Size = new Size(367, 26);
            lblCurrentTime.TabIndex = 3;
            lblCurrentTime.Text = "12:00:00";
            lblCurrentTime.TextAlign = ContentAlignment.TopCenter;
            // 
            // btnLocation
            // 
            btnLocation.BackColor = Color.Transparent;
            btnLocation.Dock = DockStyle.Right;
            btnLocation.FlatAppearance.BorderSize = 0;
            btnLocation.FlatAppearance.MouseDownBackColor = Color.FromArgb(50, 50, 50);
            btnLocation.FlatAppearance.MouseOverBackColor = Color.FromArgb(60, 60, 60);
            btnLocation.FlatStyle = FlatStyle.Flat;
            btnLocation.Font = new Font("Segoe UI", 16F, FontStyle.Regular, GraphicsUnit.Point, 0);
            btnLocation.ForeColor = Color.FromArgb(86, 206, 30);
            btnLocation.Location = new Point(417, 0);
            btnLocation.Name = "btnLocation";
            btnLocation.Size = new Size(50, 86);
            btnLocation.TabIndex = 1;
            btnLocation.Text = "📍";
            btnLocation.UseVisualStyleBackColor = false;
            btnLocation.Click += BtnLocation_Click;
            // 
            // btnHamburger
            // 
            btnHamburger.BackColor = Color.Transparent;
            btnHamburger.Dock = DockStyle.Left;
            btnHamburger.FlatAppearance.BorderSize = 0;
            btnHamburger.FlatAppearance.MouseDownBackColor = Color.FromArgb(50, 50, 50);
            btnHamburger.FlatAppearance.MouseOverBackColor = Color.FromArgb(60, 60, 60);
            btnHamburger.FlatStyle = FlatStyle.Flat;
            btnHamburger.Font = new Font("Segoe UI", 16F, FontStyle.Regular, GraphicsUnit.Point, 0);
            btnHamburger.ForeColor = Color.White;
            btnHamburger.Location = new Point(0, 0);
            btnHamburger.Name = "btnHamburger";
            btnHamburger.Size = new Size(50, 86);
            btnHamburger.TabIndex = 0;
            btnHamburger.Text = "☰";
            btnHamburger.UseVisualStyleBackColor = false;
            btnHamburger.Click += BtnHamburger_Click;

            btnLanguage.BackColor = Color.Transparent;
            btnLanguage.Dock = DockStyle.Right;
            btnLanguage.FlatAppearance.BorderSize = 0;
            btnLanguage.FlatAppearance.MouseDownBackColor = Color.FromArgb(50, 50, 50);
            btnLanguage.FlatAppearance.MouseOverBackColor = Color.FromArgb(60, 60, 60);
            btnLanguage.FlatStyle = FlatStyle.Flat;
            btnLanguage.Font = new Font("Segoe UI", 16F, FontStyle.Regular, GraphicsUnit.Point, 0);
            btnLanguage.ForeColor = Color.FromArgb(0, 122, 204);
            btnLanguage.Location = new Point(417, 0);
            btnLanguage.Name = "btnLanguage";
            btnLanguage.Size = new Size(50, 86);
            btnLanguage.TabIndex = 4;
            btnLanguage.Text = "🌐";
            btnLanguage.UseVisualStyleBackColor = false;
            btnLanguage.Click += BtnLanguage_Click;
            btnLocation.Dock = DockStyle.Right;
            btnLocation.Location = new Point(367, 0);  // Променете от 417 на 367
            btnLocation.Size = new Size(50, 86);

            // Променете lblCityName да започва след два бутона отляво:
            lblCityName.Location = new Point(100, 0);  // Променете от 50 на 100
            lblCityName.Size = new Size(267, 60);  // Променете от 367 на 267
            // 
            // panelCountdown
            // 
            panelCountdown.BackColor = Color.Transparent;
            panelCountdown.Controls.Add(lblNextPrayerName);
            panelCountdown.Controls.Add(lblUntil);
            panelCountdown.Controls.Add(lblCountdown);
            panelCountdown.Dock = DockStyle.Fill;
            panelCountdown.Location = new Point(0, 86);
            panelCountdown.Margin = new Padding(0);
            panelCountdown.Name = "panelCountdown";
            panelCountdown.Size = new Size(467, 155);
            panelCountdown.TabIndex = 1;
            // 
            // lblNextPrayerName
            // 
            lblNextPrayerName.Dock = DockStyle.Fill;
            lblNextPrayerName.Font = new Font("Segoe UI", 16F, FontStyle.Bold, GraphicsUnit.Point, 0);
            lblNextPrayerName.ForeColor = Color.FromArgb(86, 206, 30);
            lblNextPrayerName.Location = new Point(0, 90);
            lblNextPrayerName.Name = "lblNextPrayerName";
            lblNextPrayerName.Size = new Size(467, 65);
            lblNextPrayerName.TabIndex = 2;
            lblNextPrayerName.Text = "Очакваме ви отново утре!";
            lblNextPrayerName.TextAlign = ContentAlignment.TopCenter;
            // 
            // lblUntil
            // 
            lblUntil.Dock = DockStyle.Top;
            lblUntil.Font = new Font("Segoe UI", 14F, FontStyle.Regular, GraphicsUnit.Point, 0);
            lblUntil.ForeColor = Color.FromArgb(180, 180, 180);
            lblUntil.Location = new Point(0, 60);
            lblUntil.Name = "lblUntil";
            lblUntil.Size = new Size(467, 30);
            lblUntil.TabIndex = 1;
            lblUntil.Text = "до";
            lblUntil.TextAlign = ContentAlignment.MiddleCenter;
            // 
            // lblCountdown
            // 
            lblCountdown.Dock = DockStyle.Top;
            lblCountdown.Font = new Font("Segoe UI", 32F, FontStyle.Bold, GraphicsUnit.Point, 0);
            lblCountdown.ForeColor = Color.White;
            lblCountdown.Location = new Point(0, 0);
            lblCountdown.Name = "lblCountdown";
            lblCountdown.Size = new Size(467, 60);
            lblCountdown.TabIndex = 0;
            lblCountdown.Text = "- 01:25:30";
            lblCountdown.TextAlign = ContentAlignment.MiddleCenter;
            // 
            // panelElapsedWrapper
            // 
            panelElapsedWrapper.BackColor = Color.Transparent;
            panelElapsedWrapper.Controls.Add(pnlElapsedBody);
            panelElapsedWrapper.Dock = DockStyle.Fill;
            panelElapsedWrapper.Location = new Point(0, 241);
            panelElapsedWrapper.Margin = new Padding(0);
            panelElapsedWrapper.Name = "panelElapsedWrapper";
            panelElapsedWrapper.Padding = new Padding(20, 10, 20, 10);
            panelElapsedWrapper.Size = new Size(467, 86);
            panelElapsedWrapper.TabIndex = 2;
            // 
            // pnlElapsedBody
            // 
            pnlElapsedBody.BackColor = Color.FromArgb(35, 35, 35);
            pnlElapsedBody.Controls.Add(pnlProgressContainer);
            pnlElapsedBody.Controls.Add(lblElapsedTime);
            pnlElapsedBody.Controls.Add(lblElapsedName);
            pnlElapsedBody.Controls.Add(pnlRedBorder);
            pnlElapsedBody.Dock = DockStyle.Fill;
            pnlElapsedBody.Location = new Point(20, 10);
            pnlElapsedBody.Name = "pnlElapsedBody";
            pnlElapsedBody.Padding = new Padding(0, 0, 0, 10);
            pnlElapsedBody.Size = new Size(427, 66);
            pnlElapsedBody.TabIndex = 0;
            // 
            // pnlProgressContainer
            // 
            pnlProgressContainer.BackColor = Color.FromArgb(50, 50, 50);
            pnlProgressContainer.Controls.Add(pnlProgressFill);
            pnlProgressContainer.Dock = DockStyle.Bottom;
            pnlProgressContainer.Location = new Point(5, 51);
            pnlProgressContainer.Name = "pnlProgressContainer";
            pnlProgressContainer.Size = new Size(422, 5);
            pnlProgressContainer.TabIndex = 3;
            // 
            // pnlProgressFill
            // 
            pnlProgressFill.BackColor = Color.FromArgb(86, 206, 30);
            pnlProgressFill.Dock = DockStyle.Left;
            pnlProgressFill.Location = new Point(0, 0);
            pnlProgressFill.Name = "pnlProgressFill";
            pnlProgressFill.Size = new Size(0, 5);
            pnlProgressFill.TabIndex = 0;
            // 
            // lblElapsedTime
            // 
            lblElapsedTime.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            lblElapsedTime.AutoSize = true;
            lblElapsedTime.Font = new Font("Segoe UI", 10F, FontStyle.Bold, GraphicsUnit.Point, 0);
            lblElapsedTime.ForeColor = Color.White;
            lblElapsedTime.Location = new Point(350, 18);
            lblElapsedTime.Name = "lblElapsedTime";
            lblElapsedTime.Size = new Size(65, 19);
            lblElapsedTime.TabIndex = 2;
            lblElapsedTime.Text = "";
            // 
            // lblElapsedName
            // 
            lblElapsedName.AutoSize = true;
            lblElapsedName.Font = new Font("Segoe UI", 10F, FontStyle.Bold, GraphicsUnit.Point, 0);
            lblElapsedName.ForeColor = Color.FromArgb(255, 107, 107);
            lblElapsedName.Location = new Point(18, 18);
            lblElapsedName.Name = "lblElapsedName";
            lblElapsedName.Size = new Size(58, 19);
            lblElapsedName.TabIndex = 1;
            lblElapsedName.Text = "";
            // 
            // pnlRedBorder
            // 
            pnlRedBorder.BackColor = Color.FromArgb(255, 89, 78);
            pnlRedBorder.Dock = DockStyle.Left;
            pnlRedBorder.Location = new Point(0, 0);
            pnlRedBorder.Name = "pnlRedBorder";
            pnlRedBorder.Size = new Size(5, 56);
            pnlRedBorder.TabIndex = 0;
            // 
            // panelDateNav
            // 
            panelDateNav.BackColor = Color.Transparent;
            panelDateNav.Controls.Add(lblDateDisplay);
            panelDateNav.Dock = DockStyle.Fill;
            panelDateNav.Location = new Point(0, 327);
            panelDateNav.Margin = new Padding(0);
            panelDateNav.Name = "panelDateNav";
            panelDateNav.Size = new Size(467, 69);
            panelDateNav.TabIndex = 3;
            // 
            // lblDateDisplay
            // 
            lblDateDisplay.Dock = DockStyle.Fill;
            lblDateDisplay.Font = new Font("Segoe UI", 20F, FontStyle.Bold, GraphicsUnit.Point, 0);
            lblDateDisplay.ForeColor = Color.White;
            lblDateDisplay.Location = new Point(0, 0);
            lblDateDisplay.Name = "lblDateDisplay";
            lblDateDisplay.Size = new Size(467, 69);
            lblDateDisplay.TabIndex = 0;
            lblDateDisplay.Text = "21.05.2025 (вторник)";
            lblDateDisplay.TextAlign = ContentAlignment.MiddleCenter;
            // 
            // pnlListContainer
            // 
            pnlListContainer.BackColor = Color.Transparent;
            pnlListContainer.Dock = DockStyle.Fill;
            pnlListContainer.Location = new Point(0, 396);
            pnlListContainer.Margin = new Padding(0);
            pnlListContainer.Name = "pnlListContainer";
            pnlListContainer.Size = new Size(467, 415);
            pnlListContainer.TabIndex = 4;
            // 
            // lblCopyright
            // 
            lblCopyright.BackColor = Color.Transparent;
            lblCopyright.Dock = DockStyle.Fill;
            lblCopyright.Font = new Font("Segoe UI", 9F, FontStyle.Regular, GraphicsUnit.Point, 0);
            lblCopyright.ForeColor = Color.Gray;
            lblCopyright.Location = new Point(0, 811);
            lblCopyright.Margin = new Padding(0);
            lblCopyright.Name = "lblCopyright";
            lblCopyright.Size = new Size(467, 54);
            lblCopyright.TabIndex = 5;
            lblCopyright.Text = "© Приложението може да има разминавания от 0 до 60 секунди сравнение с времената от Г. Мюфтийство.";
            lblCopyright.TextAlign = ContentAlignment.MiddleCenter;
            // 
            // hamburgerMenu
            // 
            hamburgerMenu.BackColor = Color.FromArgb(45, 45, 45);
            hamburgerMenu.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point, 0);
            hamburgerMenu.Items.AddRange(new ToolStripItem[] { settingsToolStripMenuItem, aboutToolStripMenuItem, toolStripSeparator1, exitToolStripMenuItem });
            hamburgerMenu.Name = "hamburgerMenu";
            hamburgerMenu.RenderMode = ToolStripRenderMode.Professional;
            hamburgerMenu.ShowImageMargin = false;
            hamburgerMenu.Size = new Size(180, 112);
            // 
            // settingsToolStripMenuItem
            // 
            settingsToolStripMenuItem.BackColor = Color.FromArgb(45, 45, 45);
            settingsToolStripMenuItem.ForeColor = Color.White;
            settingsToolStripMenuItem.Name = "settingsToolStripMenuItem";
            settingsToolStripMenuItem.Padding = new Padding(10, 5, 10, 5);
            settingsToolStripMenuItem.Size = new Size(179, 30);
            settingsToolStripMenuItem.Text = "Настройки";
            settingsToolStripMenuItem.Click += SettingsToolStripMenuItem_Click;
            settingsToolStripMenuItem.MouseEnter += (s, e) => { settingsToolStripMenuItem.BackColor = Color.FromArgb(65, 65, 65); };
            settingsToolStripMenuItem.MouseLeave += (s, e) => { settingsToolStripMenuItem.BackColor = Color.FromArgb(45, 45, 45); };
            // 
            // aboutToolStripMenuItem
            // 
            aboutToolStripMenuItem.BackColor = Color.FromArgb(45, 45, 45);
            aboutToolStripMenuItem.ForeColor = Color.White;
            aboutToolStripMenuItem.Name = "aboutToolStripMenuItem";
            aboutToolStripMenuItem.Padding = new Padding(10, 5, 10, 5);
            aboutToolStripMenuItem.Size = new Size(179, 30);
            aboutToolStripMenuItem.Text = "За Приложението";
            aboutToolStripMenuItem.Click += AboutToolStripMenuItem_Click;
            aboutToolStripMenuItem.MouseEnter += (s, e) => { aboutToolStripMenuItem.BackColor = Color.FromArgb(65, 65, 65); };
            aboutToolStripMenuItem.MouseLeave += (s, e) => { aboutToolStripMenuItem.BackColor = Color.FromArgb(45, 45, 45); };
            // 
         
            // 
            // toolStripSeparator1
            // 
            toolStripSeparator1.BackColor = Color.FromArgb(80, 80, 80);
            toolStripSeparator1.Margin = new Padding(0);
            toolStripSeparator1.Name = "toolStripSeparator1";
            toolStripSeparator1.Size = new Size(176, 6);
            // 
            // exitToolStripMenuItem
            // 
            exitToolStripMenuItem.BackColor = Color.FromArgb(45, 45, 45);
            exitToolStripMenuItem.ForeColor = Color.FromArgb(255, 89, 78);
            exitToolStripMenuItem.Name = "exitToolStripMenuItem";
            exitToolStripMenuItem.Padding = new Padding(10, 5, 10, 5);
            exitToolStripMenuItem.Size = new Size(179, 30);
            exitToolStripMenuItem.Text = "Изход";
            exitToolStripMenuItem.Click += ExitToolStripMenuItem_Click;
            exitToolStripMenuItem.MouseEnter += (s, e) => { exitToolStripMenuItem.BackColor = Color.FromArgb(65, 65, 65); };
            exitToolStripMenuItem.MouseLeave += (s, e) => { exitToolStripMenuItem.BackColor = Color.FromArgb(45, 45, 45); };
            // 
            // trayIcon
            // 
            trayIcon.ContextMenuStrip = trayMenu;
            trayIcon.Icon = (Icon)resources.GetObject("trayIcon.Icon");
            trayIcon.Text = "Времена за Намаз";
            trayIcon.Visible = true;
            trayIcon.DoubleClick += TrayIcon_DoubleClick;
            // 
            // trayMenu
            // 
            trayMenu.BackColor = Color.FromArgb(45, 45, 45);
            trayMenu.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point, 0);
            trayMenu.Items.AddRange(new ToolStripItem[] { showToolStripMenuItem, toolStripSeparator2, exitTrayToolStripMenuItem });
            trayMenu.Name = "trayMenu";
            trayMenu.RenderMode = ToolStripRenderMode.Professional;
            trayMenu.ShowImageMargin = false;
            trayMenu.Size = new Size(151, 60);
            // 
            // showToolStripMenuItem
            // 
            showToolStripMenuItem.BackColor = Color.FromArgb(45, 45, 45);
            showToolStripMenuItem.ForeColor = Color.White;
            showToolStripMenuItem.Name = "showToolStripMenuItem";
            showToolStripMenuItem.Padding = new Padding(10, 5, 10, 5);
            showToolStripMenuItem.Size = new Size(150, 30);
            showToolStripMenuItem.Text = "Покажи";
            showToolStripMenuItem.Click += ShowToolStripMenuItem_Click;
            showToolStripMenuItem.MouseEnter += (s, e) => { showToolStripMenuItem.BackColor = Color.FromArgb(65, 65, 65); };
            showToolStripMenuItem.MouseLeave += (s, e) => { showToolStripMenuItem.BackColor = Color.FromArgb(45, 45, 45); };
            // 
            // toolStripSeparator2
            // 
            toolStripSeparator2.BackColor = Color.FromArgb(80, 80, 80);
            toolStripSeparator2.Margin = new Padding(0);
            toolStripSeparator2.Name = "toolStripSeparator2";
            toolStripSeparator2.Size = new Size(147, 6);
            // 
            // exitTrayToolStripMenuItem
            // 
            exitTrayToolStripMenuItem.BackColor = Color.FromArgb(45, 45, 45);
            exitTrayToolStripMenuItem.ForeColor = Color.FromArgb(255, 89, 78);
            exitTrayToolStripMenuItem.Name = "exitTrayToolStripMenuItem";
            exitTrayToolStripMenuItem.Padding = new Padding(10, 5, 10, 5);
            exitTrayToolStripMenuItem.Size = new Size(150, 30);
            exitTrayToolStripMenuItem.Text = "Изход";
            exitTrayToolStripMenuItem.Click += ExitTrayToolStripMenuItem_Click;
            exitTrayToolStripMenuItem.MouseEnter += (s, e) => { exitTrayToolStripMenuItem.BackColor = Color.FromArgb(65, 65, 65); };
            exitTrayToolStripMenuItem.MouseLeave += (s, e) => { exitTrayToolStripMenuItem.BackColor = Color.FromArgb(45, 45, 45); };
            // 
            // MainForm
            // 
            Icon = (Icon)resources.GetObject("trayIcon.Icon");
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.FromArgb(26, 26, 26);
            ClientSize = new Size(467, 865);
            Controls.Add(mainContainer);
            MaximizeBox = false;
            MaximumSize = new Size(800, 1200);
            MinimumSize = new Size(350, 600);
            Name = "MainForm";
            StartPosition = FormStartPosition.CenterScreen;
            Text = "Времена за Намаз";
            FormClosing += MainForm_FormClosing;
            Load += MainForm_Load;
            mainContainer.ResumeLayout(false);
            panelHeader.ResumeLayout(false);
            panelCountdown.ResumeLayout(false);
            panelElapsedWrapper.ResumeLayout(false);
            pnlElapsedBody.ResumeLayout(false);
            pnlElapsedBody.PerformLayout();
            pnlProgressContainer.ResumeLayout(false);
            panelDateNav.ResumeLayout(false);
            hamburgerMenu.ResumeLayout(false);
            trayMenu.ResumeLayout(false);
            ResumeLayout(false);
        }

        #endregion

        private System.Windows.Forms.TableLayoutPanel mainContainer;
        private System.Windows.Forms.Panel panelHeader;
        private System.Windows.Forms.Label lblCityName;
        private System.Windows.Forms.Label lblCurrentTime;
        private System.Windows.Forms.Button btnLocation;
        private System.Windows.Forms.Button btnHamburger;
        private System.Windows.Forms.Button btnLanguage;
        private System.Windows.Forms.Panel panelCountdown;
        private System.Windows.Forms.Label lblNextPrayerName;
        private System.Windows.Forms.Label lblUntil;
        private System.Windows.Forms.Label lblCountdown;
        private System.Windows.Forms.Panel panelElapsedWrapper;
        private System.Windows.Forms.Panel pnlElapsedBody;
        private System.Windows.Forms.Panel pnlProgressContainer;
        private System.Windows.Forms.Panel pnlProgressFill;
        private System.Windows.Forms.Label lblElapsedTime;
        private System.Windows.Forms.Label lblElapsedName;
        private System.Windows.Forms.Panel pnlRedBorder;
        private System.Windows.Forms.Panel panelDateNav;
        private System.Windows.Forms.Label lblDateDisplay;
        private System.Windows.Forms.Panel pnlListContainer;
        private System.Windows.Forms.Label lblCopyright;
        private System.Windows.Forms.ContextMenuStrip hamburgerMenu;
        private System.Windows.Forms.ToolStripMenuItem settingsToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem aboutToolStripMenuItem;

        private System.Windows.Forms.ToolStripSeparator toolStripSeparator1;
        private System.Windows.Forms.ToolStripMenuItem exitToolStripMenuItem;
        private System.Windows.Forms.NotifyIcon trayIcon;
        private System.Windows.Forms.ContextMenuStrip trayMenu;
        private System.Windows.Forms.ToolStripMenuItem showToolStripMenuItem;
        private System.Windows.Forms.ToolStripSeparator toolStripSeparator2;
        private System.Windows.Forms.ToolStripMenuItem exitTrayToolStripMenuItem;
    }
}