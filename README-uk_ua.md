# <img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="27vw" height="27vw"> Simple Office Installer
![Зображення-Програми-SimpleOfficeInstaller](https://github.com/user-attachments/assets/0952e51c-3b09-412e-858b-85ec16164fd7)

<img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="15vw" height="15vw"> Simple Office Installer — це програма зі зручним інтерфейсом, яка дозволяє безкоштовно завантажити різні версії Microsoft Office, включаючи:

**Office 365** (не активовано), **Office 2024**, **Office 2021**, **Office 2019** та **Office 2016**

<details>
<summary>Усі доступні версії Office</summary>
  
-----

- **Office 365 для Enterprise**
- **Office 365 для Enterprise** (без Teams)
- **Office 365 для Business**
- **Office 365 для Business** (без Teams)
- **Office 365 для Small Business Premium**
- **Office 365 для Home Premium**
- **Office 365 для Education**

-----

- **Office 2024 LTSC Professional Plus** – Активовано, Корпоративна Ліцензія
- **Office 2024 Professional Plus** – Активовано, Корпоративна Ліцензія
- **Office 2024 LTSC Standard** – Активовано, Корпоративна Ліцензія
- **Office 2024 Home** – Активовано, Роздрібна Ліцензія

-----

- **Office 2021 LTSC Professional Plus** – Активовано, Корпоративна Ліцензія
- **Office 2021 Professional Plus** – Активовано, Корпоративна Ліцензія
- **Office 2021 Professional** – Активовано, Роздрібна Ліцензія
- **Office 2021 LTSC Standard** – Активовано, Корпоративна Ліцензія
- **Office 2021 Standard** – Активовано, Корпоративна Ліцензія
- **Office 2021 Home та Student** – Активовано, Роздрібна Ліцензія
- **Office 2021 Personal** – Активовано, Роздрібна Ліцензія

-----

- **Office 2019 Professional Plus** – Активовано, Корпоративна Ліцензія
- **Office 2019 Professional** – Активовано, Роздрібна Ліцензія
- **Office 2019 Standard** – Активовано, Корпоративна Ліцензія
- **Office 2019 Home and Student** – Активовано, Роздрібна Ліцензія
- **Office 2019 Personal** – Активовано, Роздрібна Ліцензія

-----

- **Office 2016 Professional Plus** – Активовано, Роздрібна Ліцензія
- **Office 2016 Professional** – Активовано, Роздрібна Ліцензія
- **Office 2016 Standard** – Активовано, Роздрібна Ліцензія
- **Office 2016 Home та Student** – Активовано, Роздрібна Ліцензія
- **Office 2016 Personal** – Активовано, Роздрібна Ліцензія

-----

</details>

<details>
<summary>Усі доступні версії Project</summary>

-----

- **Project Online Desktop Client**

-----

- **Professional 2024** – Активовано, Корпоративна Ліцензія
- **Standard 2024** – Активовано, Корпоративна Ліцензія
  
-----

- **Professional 2021** – Активовано, Корпоративна Ліцензія
- **Standard 2021** – Активовано, Корпоративна Ліцензія

-----

- **Professional 2019** – Активовано, Корпоративна Ліцензія
- **Standard 2019** – Активовано, Корпоративна Ліцензія

-----

- **Professional 2016** – Активовано, Корпоративна Ліцензія
- **Standard 2016** – Активовано, Корпоративна Ліцензія

-----

</details>

<details>
<summary>Усі доступні версії Visio</summary>

-----

- **Visio Plan 2**

-----

- **LTSC Professional 2024** – Активовано, Корпоративна Ліцензія
- **LTSC Standard 2024** – Активовано, Корпоративна Ліцензія

-----

- **LTSC Professional 2021** – Активовано, Корпоративна Ліцензія
- **LTSC Standard 2021** – Активовано, Корпоративна Ліцензія

-----

- **LTSC Professional 2019** – Активовано, Корпоративна Ліцензія
- **LTSC Standard 2019** – Активовано, Корпоративна Ліцензія

-----

- **Professional 2016** – Активовано, Корпоративна Ліцензія
- **Standard 2016** – Активовано, Корпоративна Ліцензія

-----

</details>

## 💻 Системні вимоги

- Windows 10 або новіша
- Server 2019 або новіша

## 📥 Завантаження

Завантажте [<img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="15vw" height="15vw"> Simple Office Installer](https://github.com/MaximeriX/SimpleOfficeInstaller/releases/tag/v1.0.7) з розділу Releases.

## 🔍 Як це працює
#### 🖱️ При натисканні кнопки Запустити Інсталятор Office
1. Генерується `config.xml`
2. Завантажується і запускається `officedeploymenttool.exe` з [Офіційного сайту Microsoft](https://download.microsoft.com/download/6c1eeb25-cf8b-41d9-8d0d-cc1dbc032140/officedeploymenttool_18526-20146.exe)
3. Запускається `setup.exe /Configure config.xml`
   
*Примітка*: Усі файли, які програма завантажує/генерує під час встановлення Office, зберігаються в `%TEMP%\OfficeSetupFiles`

## 🌟 Contribution
### 🐞 Помилки
  Якщо ви знайшли помилку, повідомте про неї в розділі [Issues](https://github.com/MaximeriX/SimpleOfficeInstaller/issues/new). Якщо можете виправити — відкрийте [Pull Request](https://github.com/MaximeriX/SimpleOfficeInstaller/pulls).
### 💡 Ідеї
  Якщо у вас є ідея для додатку — поділіться нею в [Discussions](https://github.com/MaximeriX/SimpleOfficeInstaller/discussions/new?category=ideas)
### 🌐 Переклад
Якщо хочете перекласти додаток на свою мову:
  1. Зробіть fork цієї репозиторію.
  2. Перекладіть вміст `App/locales/en_us.json` та збережіть новий файл як `your_language_code.json` *(наприклад, es_es.json)*.
  3. Додайте свою мову до `App/locales/list.json`.
  4. Додайте всі варіанти вашої мови *(наприклад, es_ar, es_gt)* до `App/locales/supported.json` (Список мовних кодів **[тут](https://github.com/MaximeriX/SimpleOfficeInstaller/blob/main/Lang_codes.md)**).
  5. *Необов’язково:* Перекладіть `README.md` та збережіть як `README-your_language_code.md` *(наприклад, README-es_es.md)*.
  6. Відкрийте pull request.
### 🖥️ Код
 Якщо ви знаєте, як написати додаток на **Electron**, ласкаво просимо! Просто відкрийте [Pull Request](https://github.com/MaximeriX/SimpleOfficeInstaller/pulls), опишіть свої зміни і чекайте на відповідь.
