
# RobloxAiReportGen

Use modern LLMs to automatically generate reports for rule‑breaking Roblox users via the `illegal-content-reporting` form.

> **Limitations:** Reports are generated solely from the user's **username**, **display name**, and **user description**.

---

## Quick start

1. **Install Python**
   This project was tested with **Python 3.12.10**. Download from python.org if needed.

2. **Clone the repository**

   ```bash
   git clone https://github.com/miniozoid3/RobloxAiReportGen.git
   ```

3. **Create and activate a virtual environment** (recommended)

   * On Windows (PowerShell)

     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * On Windows (Command Prompt)

     ```cmd
     python -m venv venv
     venv\Scripts\activate.bat
     ```
   * On macOS / Linux

     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

4. **Change working directory**

   ```bash
   cd RobloxAiReportGen/LocalApi
   ```

5. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

6. **Obtain Google Gemini API key**
   Create an API key from your [Google AI console](https://aistudio.google.com/app/apikey). Put the key into the `.env` file as described below.

7. **Create / edit `.env`**
   Example `.env` contents:

   ```env
   GeminiKey=PutYourGeminiApiKeyHere
   GeminiPromptUrl="https://miniozoid.com/robloxreporter.txt"
   ```

8. **Run the local API**

   ```bash
   python main.py
   ```

   (Run this from `RobloxAiReportGen/LocalApi`.)

9. **Install the userscript (Tampermonkey)**
   Install the userscript from this link:

   * [Install](https://github.com/miniozoid3/RobloxAiReportGen/raw/refs/heads/main/ReportGen.user.js)

   * Use Tampermonkey or a compatible userscript manager.
   * Edit the userscript to replace the placeholder email (`YourEmailHere`) with your email address.

10. **Use it**
    Visit any Roblox profile in your browser and click the new **Report** button added by the userscript to generate a report.

---

## Notes & recommendations

* **Respect Roblox policies & privacy.** Automated reporting systems can cause harm if misused. Use responsibly and verify outputs before submitting reports to official moderation channels.
* **False positives:** Because the system uses only username/display name/description, results may be incorrect. Always review generated reports.
* **Security:** Treat API keys as secrets. Use environment variables, not hard-coded keys. Do not share keys or commit them to public repos.
* **Compatibility:** The project was tested on Python 3.12.10; newer Python versions may work but aren’t guaranteed.

---

## Troubleshooting

* **`ModuleNotFoundError`**: ensure your virtual environment is activated and `pip install -r requirements.txt` completed successfully.
* **API key errors**: check `.env` formatting and that the key is valid. Ensure your network permits outbound calls to the API endpoint.
* **Userscript not working**: confirm Tampermonkey is enabled, that the script URL is up-to-date, and you edited the email placeholder.

---

## Contributing

PRs welcome. Please:

* Open issues for bugs/feature requests
* Respect privacy and safety when changing report logic
* Add tests for parsing and classification logic where reasonable

---

## License

This software is published with the GNU AGPLv3 license.

---

