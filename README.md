# <img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="27vw" height="27vw"> Simple Office Installer
![SimpleOfficeInstaller-App-Image](https://github.com/MaximeriX/SimpleOfficeInstaller/blob/main/SimpleOfficeInstaller-Image.png?raw=true)

Espanol: [README-es_es.md](README-es_es.md) | Русский: [README-ru_ru.md](README-ru_ru.md) | Українська: [README-uk_ua.md](README-uk_ua.md)

---

<img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="15vw" height="15vw"> Simple Office Installer is a user-friendly program that allows you to download various versions of Microsoft Office for free, including:

**Office 365** (Not activated), **Office 2024**, **Office 2021**, **Office 2019** and **Office 2016**

<details>
<summary>All included Office versions</summary>

---

- **Office 365 for Enterprise**
- **Office 365 for Enterprise** (no Teams)
- **Office 365 for Business**
- **Office 365 for Business** (no Teams)
- **Office 365 for Small Business Premium**
- **Office 365 for Home Premium**
- **Office 365 for Education**

---

- **Office 2024 LTSC Professional Plus** - Activated, Volume License
- **Office 2024 Professional Plus** - Retail License
- **Office 2024 LTSC Standard** - Activated, Volume License
- **Office 2024 Home** - Retail License

---

- **Office 2021 LTSC Professional Plus** - Activated, Volume License
- **Office 2021 Professional Plus** - Retail License
- **Office 2021 Professional** - Retail License
- **Office 2021 LTSC Standard** - Activated, Volume License
- **Office 2021 Standard** - Retail License
- **Office 2021 Home and Student** - Retail License
- **Office 2021 Personal** - Retail License

---

- **Office 2019 Professional Plus** - Activated, Volume License
- **Office 2019 Professional** - Retail License
- **Office 2019 Standard** - Activated, Volume License
- **Office 2019 Home and Student** - Retail License
- **Office 2019 Personal** - Retail License

---

- **Office 2016 Professional Plus** - Retail License
- **Office 2016 Professional** - Retail License
- **Office 2016 Standard** - Retail License
- **Office 2016 Home and Student** - Retail License
- **Office 2016 Personal** - Retail License

---

</details>

<details>
<summary>All included Project versions</summary>

---

- **Project Online Desktop Client**

---

- **Professional 2024** - Activated, Volume License
- **Standard 2024** - Activated, Volume License

---

- **Professional 2021** - Activated, Volume License
- **Standard 2021** - Activated, Volume License

---

- **Professional 2019** - Activated, Volume License
- **Standard 2019** - Activated, Volume License

---

- **Professional 2016** - Activated, Volume License
- **Standard 2016** - Activated, Volume License

---

</details>

<details>
<summary>All included Visio versions</summary>

---

- **Visio Plan 2**

---

- **LTSC Professional 2024** - Activated, Volume License
- **LTSC Standard 2024** - Activated, Volume License

---

- **LTSC Professional 2021** - Activated, Volume License
- **LTSC Standard 2021** - Activated, Volume License

---

- **LTSC Professional 2019** - Activated, Volume License
- **LTSC Standard 2019** - Activated, Volume License

---

- **Professional 2016** - Activated, Volume License
- **Standard 2016** - Activated, Volume License

---

</details>

## 💻 System Requirements

- Windows 10 or later
- Server 2019 or later

## 📥 Download

Download <img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="15vw" height="15vw"> [Simple Office Installer](https://github.com/MaximeriX/SimpleOfficeInstaller/releases/tag/v1.0.8) from the Releases section.

## 🔍 How It Works

#### 🖱️ When the Launch Office Installer button is pressed:

1. The app generates `config.xml`
2. It downloads and runs `officedeploymenttool.exe` from [Microsoft's official site](https://download.microsoft.com/download/6c1eeb25-cf8b-41d9-8d0d-cc1dbc032140/officedeploymenttool_20026-20112.exe)
3. It runs `setup.exe /configure config.xml`

Note: Every file that the program downloads or generates during Office installation is stored in `%TEMP%\OfficeSetupFiles`

### 🐞 Bugs

If you find a bug, post it in [Issues](https://github.com/MaximeriX/SimpleOfficeInstaller/issues/new). If you can fix it, open a [Pull Request](https://github.com/MaximeriX/SimpleOfficeInstaller/pulls).