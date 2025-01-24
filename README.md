# Simple Office Installer
![SimpleOfficeInstaller-App-Image](https://github.com/user-attachments/assets/9d1d1529-5eea-4d20-a9c7-a9a770603cf5)

Simple Office Installer is a user-friendly program that allows you to download various versions of Microsoft Office for free, including:

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

## System Requirements

- Windows 10 or later
- Server 2019 or later

## Download

Download the [Simple Office Installer](https://github.com/MaximeriX/SimpleOfficeInstaller/releases/tag/latest) from the releases section.

## How it Works
#### When Launch Office Installer button pressed
1. Generates `config.xml`
2. Downloads and runs `officedeploymenttool.exe` from [Microsoft's official site](https://download.microsoft.com/download/2/7/A/27AF1BE6-DD20-4CB4-B154-EBAB8A7D4A7E/officedeploymenttool_18227-20162.exe)
3. Runs `setup.exe /Configure configuration.xml`
   
*Note*: Every file that the program downloads/generates is located in `%TEMP%\OfficeSetupFiles`

### Contributions and feedback are welcome! Feel free to suggest any changes or improvements!
