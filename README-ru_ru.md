# <img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="27vw" height="27vw"> Simple Office Installer
![SimpleOfficeInstaller-App-Image](https://github.com/MaximeriX/SimpleOfficeInstaller/blob/main/SimpleOfficeInstaller-Image.png?raw=true)

English: [README.md](README.md) | Espanol: [README-es_es.md](README-es_es.md) | Українська: [README-uk_ua.md](README-uk_ua.md)

---

<img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="15vw" height="15vw"> Simple Office Installer - это удобная программа, которая позволяет бесплатно скачивать разные версии Microsoft Office, включая:

**Office 365** (Не активирован), **Office 2024**, **Office 2021**, **Office 2019** и **Office 2016**

<details>
<summary>Все доступные версии Office</summary>

---

- **Office 365 для Enterprise**
- **Office 365 для Enterprise** (без Teams)
- **Office 365 для Business**
- **Office 365 для Business** (без Teams)
- **Office 365 для Small Business Premium**
- **Office 365 для Home Premium**
- **Office 365 для Education**

---

- **Office 2024 LTSC Professional Plus** - Активирован, корпоративная лицензия
- **Office 2024 Professional Plus** - Розничная лицензия
- **Office 2024 LTSC Standard** - Активирован, корпоративная лицензия
- **Office 2024 Home** - Розничная лицензия

---

- **Office 2021 LTSC Professional Plus** - Активирован, корпоративная лицензия
- **Office 2021 Professional Plus** - Розничная лицензия
- **Office 2021 Professional** - Розничная лицензия
- **Office 2021 LTSC Standard** - Активирован, корпоративная лицензия
- **Office 2021 Standard** - Розничная лицензия
- **Office 2021 Home and Student** - Розничная лицензия
- **Office 2021 Personal** - Розничная лицензия

---

- **Office 2019 Professional Plus** - Активирован, корпоративная лицензия
- **Office 2019 Professional** - Розничная лицензия
- **Office 2019 Standard** - Активирован, корпоративная лицензия
- **Office 2019 Home and Student** - Розничная лицензия
- **Office 2019 Personal** - Розничная лицензия

---

- **Office 2016 Professional Plus** - Розничная лицензия
- **Office 2016 Professional** - Розничная лицензия
- **Office 2016 Standard** - Розничная лицензия
- **Office 2016 Home and Student** - Розничная лицензия
- **Office 2016 Personal** - Розничная лицензия

---

</details>

<details>
<summary>Все доступные версии Project</summary>

---

- **Project Online Desktop Client**

---

- **Professional 2024** - Активирован, корпоративная лицензия
- **Standard 2024** - Активирован, корпоративная лицензия

---

- **Professional 2021** - Активирован, корпоративная лицензия
- **Standard 2021** - Активирован, корпоративная лицензия

---

- **Professional 2019** - Активирован, корпоративная лицензия
- **Standard 2019** - Активирован, корпоративная лицензия

---

- **Professional 2016** - Активирован, корпоративная лицензия
- **Standard 2016** - Активирован, корпоративная лицензия

---

</details>

<details>
<summary>Все доступные версии Visio</summary>

---

- **Visio Plan 2**

---

- **LTSC Professional 2024** - Активирован, корпоративная лицензия
- **LTSC Standard 2024** - Активирован, корпоративная лицензия

---

- **LTSC Professional 2021** - Активирован, корпоративная лицензия
- **LTSC Standard 2021** - Активирован, корпоративная лицензия

---

- **LTSC Professional 2019** - Активирован, корпоративная лицензия
- **LTSC Standard 2019** - Активирован, корпоративная лицензия

---

- **Professional 2016** - Активирован, корпоративная лицензия
- **Standard 2016** - Активирован, корпоративная лицензия

---

</details>

## 💻 Системные требования

- Windows 10 или новее
- Server 2019 или новее

## 📥 Загрузка

Скачайте [Simple Office Installer](https://github.com/MaximeriX/SimpleOfficeInstaller/releases/tag/v1.0.8) из раздела Releases.

## 🔍 Как это работает

#### 🖱️ Когда нажимается кнопка Launch Office Installer:

1. Приложение создает `config.xml`
2. Скачивает и запускает `officedeploymenttool.exe` с [официального сайта Microsoft](https://download.microsoft.com/download/6c1eeb25-cf8b-41d9-8d0d-cc1dbc032140/officedeploymenttool_20026-20112.exe)
3. Запускает `setup.exe /configure config.xml`

Примечание: Все файлы, которые приложение скачивает или создает во время установки Office, сохраняются в `%TEMP%\OfficeSetupFiles`

### 🐞 Ошибки

Если вы нашли ошибку, создайте сообщение в [Issues](https://github.com/MaximeriX/SimpleOfficeInstaller/issues/new). Если можете исправить ее сами, откройте [Pull Request](https://github.com/MaximeriX/SimpleOfficeInstaller/pulls).
