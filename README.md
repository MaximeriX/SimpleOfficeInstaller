# <img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="27vw" height="27vw"> Simple Office Installer
![SimpleOfficeInstaller-App-Image](https://github.com/MaximeriX/SimpleOfficeInstaller/blob/main/SimpleOfficeInstaller-Image.png)

<img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="15vw" height="15vw"> Simple Office Installer is a user-friendly program that allows you to download various versions of Microsoft Office for free, including:

**Office 365** (Not activated), **Office 2024**, **Office 2021**, **Office 2019** and **Office 2016**

<details>
<summary>All included Office versions</summary>
  
-----

- **Office 365 for Enterprise**
- **Office 365 for Enterprise** (no Teams)
- **Office 365 for Business**
- **Office 365 for Business** (no Teams)

-----

- **Office 2024 LTSC Professional Plus** - Activated, Volume License
- **Office 2024 Professional Plus** - Activated, Volume License
- **Office 2024 LTSC Standard** - Activated, Volume License

-----

- **Office 2021 LTSC Professional Plus** - Activated, Volume License
- **Office 2021 Professional Plus** - Activated, Volume License
- **Office 2021 Professional** - Activated, Volume License
- **Office 2021 LTSC Standard** - Activated, Volume License
- **Office 2021 Standard** - Activated, Volume License

-----

- **Office 2019 Professional Plus** - Activated, Volume License
- **Office 2019 Professional** - Activated, Volume License
- **Office 2019 Standard** - Activated, Volume License

-----

- **Office 2016 Professional Plus** - Activated, Retail License
- **Office 2016 Professional** - Activated, Retail License
- **Office 2016 Standard** - Activated, Retail License

-----

</details>

## 💻 System Requirements

- Windows 10 or later
- Server 2019 or later

## 📥 Download

Download the [<img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="15vw" height="15vw"> Simple Office Installer](https://github.com/MaximeriX/SimpleOfficeInstaller/releases/tag/v1.0.2) from the releases section.

## 🔍 How it Works
#### 🖱️ When Launch Office Installer button pressed
1. Generates `config.xml`
2. Downloads and runs `officedeploymenttool.exe` from [Microsoft's official site](https://download.microsoft.com/download/2/7/A/27AF1BE6-DD20-4CB4-B154-EBAB8A7D4A7E/officedeploymenttool_18227-20162.exe)
3. Runs `setup.exe /Configure config.xml`
   
*Note*: Every file that the program downloads/generates during office installation is located in `%TEMP%\OfficeSetupFiles`

## 🌟 Contribution
### 🐞 Bugs
  If you find a bug, you can post it in the [Issues](https://github.com/MaximeriX/SimpleOfficeInstaller/issues/new) section. If you can fix it, open a [Pull Request](https://github.com/MaximeriX/SimpleOfficeInstaller/pulls).
### 💡 Ideas
  If you have an idea for an app, you can post it on [Discussions](https://github.com/MaximeriX/SimpleOfficeInstaller/discussions/new?category=ideas)
### 🌐 Translation
If you want to translate the app to your language, follow these steps: 
  1. Fork this repository.
  2. Translate the contents of `App/locales/en_us.json` and save the new file like `your_language_code.json` *(e.g., uk_ua.json)*.
  3. Add your language to `App/locales/list.json`.
  4. Add all variations of your language *(e.g., en_gb, en_us)* to `App/locales/supported.json` (You can find the list of language codes **[here](https://github.com/MaximeriX/SimpleOfficeInstaller/blob/main/Lang_codes.md)**).
  5. *Optinal:* Translate `README.md` to your language and save it as `README-your_language_code.md` *(e.g., README-uk_ua.md)*.
  6. Open a pull request.
### 🖥️ Code
  If you know how to code an **Electron app**, you're welcome! Just open a [Pull Request](https://github.com/MaximeriX/SimpleOfficeInstaller/pulls), describe what you added, and wait for a response.
