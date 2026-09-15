using System.Diagnostics;
using System.Net.Http;
using System.Threading;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.Windows.Forms;

internal static class Program
{
    private const string LocalUrl = "http://localhost:3000/";
    private const string MutexName = "DailyPlanner.Desktop.SingleInstance";
    private const string ActivateEventName = "DailyPlanner.Desktop.Activate";
    private static readonly string ProjectRoot = ResolveProjectRoot();
    private static readonly string LegacyChromeProfile = Path.Combine(ProjectRoot, ".daily-planner-browser");
    private static Process? serverProcess;
    private static bool startedServer;

    [STAThread]
    private static void Main(string[] args)
    {
        if (args.Any((arg) => string.Equals(arg, "--recover-old", StringComparison.OrdinalIgnoreCase)))
        {
            LaunchLegacyChrome();
            return;
        }

        using var mutex = new Mutex(true, MutexName, out var isFirstInstance);
        if (!isFirstInstance)
        {
            SignalExistingInstance();
            return;
        }

        if (!IsReady().GetAwaiter().GetResult())
        {
            StartLocalServer();
            if (!WaitForReady().GetAwaiter().GetResult())
            {
                MessageBox.Show($"Daily Planner could not start. Please make sure the project folder is available:\n\n{ProjectRoot}", "Daily Planner", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                StopLocalServer();
                return;
            }
        }

        ApplicationConfiguration.Initialize();
        using var activateEvent = new EventWaitHandle(false, EventResetMode.AutoReset, ActivateEventName);
        using var window = new PlannerWindow();
        var listener = new Thread(() => ListenForActivation(window, activateEvent))
        {
            IsBackground = true,
            Name = "Daily Planner activation listener",
        };
        listener.Start();
        window.FormClosed += (_, _) => activateEvent.Set();

        Application.Run(window);
        StopLocalServer();
    }

    private static void LaunchLegacyChrome()
    {
        var chrome = @"C:\Program Files\Google\Chrome\Application\chrome.exe";
        if (!File.Exists(chrome)) return;
        Process.Start(new ProcessStartInfo
        {
            FileName = chrome,
            Arguments = $"--app=\"{LocalUrl}\" --user-data-dir=\"{LegacyChromeProfile}\" --no-first-run --no-default-browser-check",
            UseShellExecute = true,
        });
    }

    private static string ResolveProjectRoot()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current is not null)
        {
            if (File.Exists(Path.Combine(current.FullName, "package.json"))) return current.FullName;
            current = current.Parent;
        }

        var workingDirectory = Directory.GetCurrentDirectory();
        return File.Exists(Path.Combine(workingDirectory, "package.json")) ? workingDirectory : AppContext.BaseDirectory;
    }

    private static void SignalExistingInstance()
    {
        try
        {
            using var activateEvent = EventWaitHandle.OpenExisting(ActivateEventName);
            activateEvent.Set();
        }
        catch (WaitHandleCannotBeOpenedException)
        {
            // The first window may be closing at the exact moment the second click happens.
        }
    }

    private static void ListenForActivation(Form window, EventWaitHandle activateEvent)
    {
        while (!window.IsDisposed && activateEvent.WaitOne())
        {
            if (window.IsDisposed || !window.IsHandleCreated) continue;
            try
            {
                window.BeginInvoke(new Action(() =>
                {
                    if (window.WindowState == FormWindowState.Minimized) window.WindowState = FormWindowState.Normal;
                    window.Show();
                    window.Activate();
                    window.BringToFront();
                }));
            }
            catch (InvalidOperationException)
            {
                return;
            }
        }
    }

    private static void StartLocalServer()
    {
        var commandShell = Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe";
        serverProcess = Process.Start(new ProcessStartInfo
        {
            FileName = commandShell,
            Arguments = "/d /c npm run dev",
            WorkingDirectory = ProjectRoot,
            CreateNoWindow = true,
            UseShellExecute = false,
            WindowStyle = ProcessWindowStyle.Hidden,
        });
        startedServer = serverProcess is not null;
    }

    private static async Task<bool> IsReady()
    {
        using var client = new HttpClient { Timeout = TimeSpan.FromMilliseconds(700) };
        try
        {
            using var response = await client.GetAsync(LocalUrl);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private static async Task<bool> WaitForReady()
    {
        for (var attempt = 0; attempt < 60; attempt++)
        {
            if (await IsReady()) return true;
            await Task.Delay(500);
        }
        return false;
    }

    private static void StopLocalServer()
    {
        if (!startedServer || serverProcess is null) return;
        try
        {
            if (!serverProcess.HasExited) serverProcess.Kill(entireProcessTree: true);
        }
        catch (InvalidOperationException) { }
        catch (System.ComponentModel.Win32Exception) { }
        finally
        {
            serverProcess.Dispose();
            serverProcess = null;
            startedServer = false;
        }
    }
}

internal sealed class PlannerWindow : Form
{
    private readonly WebView2 webView = new() { Dock = DockStyle.Fill };

    public PlannerWindow()
    {
        Text = "Daily Planner";
        StartPosition = FormStartPosition.CenterScreen;
        ClientSize = new Size(1180, 760);
        MinimumSize = new Size(760, 560);
        BackColor = Color.FromArgb(246, 248, 244);
        Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
        Controls.Add(webView);
        Shown += LoadPlanner;
    }

    private async void LoadPlanner(object? sender, EventArgs e)
    {
        try
        {
            var dataDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "DailyPlanner", "WebView2");
            Directory.CreateDirectory(dataDirectory);
            webView.CreationProperties = new CoreWebView2CreationProperties { UserDataFolder = dataDirectory };
            await webView.EnsureCoreWebView2Async();
            webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
            webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            webView.CoreWebView2.NewWindowRequested += (_, args) =>
            {
                args.Handled = true;
                webView.CoreWebView2.Navigate(args.Uri);
            };
            webView.Source = new Uri("http://localhost:3000/");
        }
        catch (Exception error)
        {
            MessageBox.Show($"应用窗口无法加载。请确认 Microsoft Edge WebView2 Runtime 已安装。\n\n{error.Message}", "Daily Planner", MessageBoxButtons.OK, MessageBoxIcon.Error);
            Close();
        }
    }
}
