# <img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="27vw" height="27vw"> Simple Office Installer
![SimpleOfficeInstaller-App-Image](https://github.com/MaximeriX/SimpleOfficeInstaller/blob/main/SimpleOfficeInstaller-Image.png?raw=true)

English: [README.md](README.md) | Русский: [README-ru_ru.md](README-ru_ru.md) | Українська: [README-uk_ua.md](README-uk_ua.md)

---

<img src="https://github.com/user-attachments/assets/54cb006d-1378-48d8-bf9d-cd232246d33a" width="15vw" height="15vw"> Simple Office Installer es una aplicacion facil de usar que permite descargar varias versiones de Microsoft Office gratis, incluyendo:

**Office 365** (No activado), **Office 2024**, **Office 2021**, **Office 2019** y **Office 2016**

<details>
<summary>Todas las versiones de Office incluidas</summary>

---

- **Office 365 para Enterprise**
- **Office 365 para Enterprise** (sin Teams)
- **Office 365 para Business**
- **Office 365 para Business** (sin Teams)
- **Office 365 para Small Business Premium**
- **Office 365 para Home Premium**
- **Office 365 para Education**

---

- **Office 2024 LTSC Professional Plus** - Activado, licencia por volumen
- **Office 2024 Professional Plus** - Licencia retail
- **Office 2024 LTSC Standard** - Activado, licencia por volumen
- **Office 2024 Home** - Licencia retail

---

- **Office 2021 LTSC Professional Plus** - Activado, licencia por volumen
- **Office 2021 Professional Plus** - Licencia retail
- **Office 2021 Professional** - Licencia retail
- **Office 2021 LTSC Standard** - Activado, licencia por volumen
- **Office 2021 Standard** - Licencia retail
- **Office 2021 Home and Student** - Licencia retail
- **Office 2021 Personal** - Licencia retail

---

- **Office 2019 Professional Plus** - Activado, licencia por volumen
- **Office 2019 Professional** - Licencia retail
- **Office 2019 Standard** - Activado, licencia por volumen
- **Office 2019 Home and Student** - Licencia retail
- **Office 2019 Personal** - Licencia retail

---

- **Office 2016 Professional Plus** - Licencia retail
- **Office 2016 Professional** - Licencia retail
- **Office 2016 Standard** - Licencia retail
- **Office 2016 Home and Student** - Licencia retail
- **Office 2016 Personal** - Licencia retail

---

</details>

<details>
<summary>Todas las versiones de Project incluidas</summary>

---

- **Project Online Desktop Client**

---

- **Professional 2024** - Activado, licencia por volumen
- **Standard 2024** - Activado, licencia por volumen

---

- **Professional 2021** - Activado, licencia por volumen
- **Standard 2021** - Activado, licencia por volumen

---

- **Professional 2019** - Activado, licencia por volumen
- **Standard 2019** - Activado, licencia por volumen

---

- **Professional 2016** - Activado, licencia por volumen
- **Standard 2016** - Activado, licencia por volumen

---

</details>

<details>
<summary>Todas las versiones de Visio incluidas</summary>

---

- **Visio Plan 2**

---

- **LTSC Professional 2024** - Activado, licencia por volumen
- **LTSC Standard 2024** - Activado, licencia por volumen

---

- **LTSC Professional 2021** - Activado, licencia por volumen
- **LTSC Standard 2021** - Activado, licencia por volumen

---

- **LTSC Professional 2019** - Activado, licencia por volumen
- **LTSC Standard 2019** - Activado, licencia por volumen

---

- **Professional 2016** - Activado, licencia por volumen
- **Standard 2016** - Activado, licencia por volumen

---

</details>

## 💻 Requisitos del sistema

- Windows 10 o posterior
- Server 2019 o posterior

## 📥 Descarga

Descarga [Simple Office Installer](https://github.com/MaximeriX/SimpleOfficeInstaller/releases/tag/v1.1.0) desde la seccion Releases.

## 🔍 Como funciona

#### 🖱️ Cuando se pulsa el boton Launch Office Installer:

1. La aplicacion genera `config.xml`
2. Descarga y ejecuta `officedeploymenttool.exe` desde el [sitio oficial de Microsoft](https://download.microsoft.com/download/6c1eeb25-cf8b-41d9-8d0d-cc1dbc032140/officedeploymenttool_20026-20112.exe)
3. Ejecuta `setup.exe /configure config.xml`

Nota: Todos los archivos que la aplicacion descarga o genera durante la instalacion de Office se guardan en `%TEMP%\OfficeSetupFiles`

### 🐞 Errores

Si encuentras un error, publicalo en [Issues](https://github.com/MaximeriX/SimpleOfficeInstaller/issues/new). Si puedes arreglarlo, abre un [Pull Request](https://github.com/MaximeriX/SimpleOfficeInstaller/pulls).
