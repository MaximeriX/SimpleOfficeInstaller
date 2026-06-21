# <img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="27vw" height="27vw"> Simple Office Installer
![SimpleOfficeInstaller-App-Image](https://github.com/MaximeriX/SimpleOfficeInstaller/blob/main/SimpleOfficeInstaller-Image.png?raw=true)

English: [README.md](README.md) | Espanol: [README-es_es.md](README-es_es.md) | Русский: [README-ru_ru.md](README-ru_ru.md)

---

<img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="15vw" height="15vw"> Simple Office Installer - це зручна програма, яка дозволяє безкоштовно завантажувати різні версії Microsoft Office, включаючи:

**Office 365** (Не активовано), **Office 2024**, **Office 2021**, **Office 2019** та **Office 2016**

<details>
<summary>Усі доступні версії Office</summary>

---

- **Office 365 для Enterprise**
- **Office 365 для Enterprise** (без Teams)
- **Office 365 для Business**
- **Office 365 для Business** (без Teams)
- **Office 365 для Small Business Premium**
- **Office 365 для Home Premium**
- **Office 365 для Education**

---

- **Office 2024 LTSC Professional Plus** - Активовано, корпоративна ліцензія
- **Office 2024 Professional Plus** - Роздрібна ліцензія
- **Office 2024 LTSC Standard** - Активовано, корпоративна ліцензія
- **Office 2024 Home** - Роздрібна ліцензія

---

- **Office 2021 LTSC Professional Plus** - Активовано, корпоративна ліцензія
- **Office 2021 Professional Plus** - Роздрібна ліцензія
- **Office 2021 Professional** - Роздрібна ліцензія
- **Office 2021 LTSC Standard** - Активовано, корпоративна ліцензія
- **Office 2021 Standard** - Роздрібна ліцензія
- **Office 2021 Home and Student** - Роздрібна ліцензія
- **Office 2021 Personal** - Роздрібна ліцензія

---

- **Office 2019 Professional Plus** - Активовано, корпоративна ліцензія
- **Office 2019 Professional** - Роздрібна ліцензія
- **Office 2019 Standard** - Активовано, корпоративна ліцензія
- **Office 2019 Home and Student** - Роздрібна ліцензія
- **Office 2019 Personal** - Роздрібна ліцензія

---

- **Office 2016 Professional Plus** - Роздрібна ліцензія
- **Office 2016 Professional** - Роздрібна ліцензія
- **Office 2016 Standard** - Роздрібна ліцензія
- **Office 2016 Home and Student** - Роздрібна ліцензія
- **Office 2016 Personal** - Роздрібна ліцензія

---

</details>

<details>
<summary>Усі доступні версії Project</summary>

---

- **Project Online Desktop Client**

---

- **Professional 2024** - Активовано, корпоративна ліцензія
- **Standard 2024** - Активовано, корпоративна ліцензія

---

- **Professional 2021** - Активовано, корпоративна ліцензія
- **Standard 2021** - Активовано, корпоративна ліцензія

---

- **Professional 2019** - Активовано, корпоративна ліцензія
- **Standard 2019** - Активовано, корпоративна ліцензія

---

- **Professional 2016** - Активовано, корпоративна ліцензія
- **Standard 2016** - Активовано, корпоративна ліцензія

---

</details>

<details>
<summary>Усі доступні версії Visio</summary>

---

- **Visio Plan 2**

---

- **LTSC Professional 2024** - Активовано, корпоративна ліцензія
- **LTSC Standard 2024** - Активовано, корпоративна ліцензія

---

- **LTSC Professional 2021** - Активовано, корпоративна ліцензія
- **LTSC Standard 2021** - Активовано, корпоративна ліцензія

---

- **LTSC Professional 2019** - Активовано, корпоративна ліцензія
- **LTSC Standard 2019** - Активовано, корпоративна ліцензія

---

- **Professional 2016** - Активовано, корпоративна ліцензія
- **Standard 2016** - Активовано, корпоративна ліцензія

---

</details>

## 💻 Системні вимоги

- Windows 10 або новіша
- Server 2019 або новіша

## 📥 Завантаження

Завантажте [Simple Office Installer](https://github.com/MaximeriX/SimpleOfficeInstaller/releases/tag/v1.1.0) з розділу Releases.

## 🔍 Як це працює

#### 🖱️ Коли натискається кнопка Launch Office Installer:

1. Програма створює `config.xml`
2. Завантажує та запускає `officedeploymenttool.exe` з [офіційного сайту Microsoft](https://download.microsoft.com/download/6c1eeb25-cf8b-41d9-8d0d-cc1dbc032140/officedeploymenttool_20026-20112.exe)
3. Запускає `setup.exe /configure config.xml`

Примітка: Усі файли, які програма завантажує або створює під час встановлення Office, зберігаються у `%TEMP%\OfficeSetupFiles`

### 🐞 Помилки

Якщо ви знайшли помилку, повідомте про неї в [Issues](https://github.com/MaximeriX/SimpleOfficeInstaller/issues/new). Якщо можете виправити її самостійно, відкрийте [Pull Request](https://github.com/MaximeriX/SimpleOfficeInstaller/pulls).
