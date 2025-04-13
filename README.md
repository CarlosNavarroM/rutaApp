# Proyecto X

Este repositorio contiene dos aplicaciones principales y recursos compartidos. En la imagen adjunta se muestra la estructura de carpetas y archivos, organizada de la siguiente forma:

```
mobile-app/
shared/
firebase/
images/
acafaltaagregarlogo/
web-admin/
...
README.md
```

A continuación se describe cada sección:

---

## Estructura del Proyecto

- **`mobile-app/`**  
  Contiene la aplicación móvil desarrollada con **Ionic y Angular**.  
  Incluye configuraciones clave como:
  - `capacitor.config.ts`
  - `ionic.config.json`
  - Archivos necesarios para el desarrollo y despliegue de la aplicación móvil.

- **`web-admin/`**  
  Contiene el **panel de administración web** desarrollado con **Angular**.  
  Incluye configuraciones como:
  - `angular.json`
  - `server.ts` (para Server-Side Rendering - SSR)
  - Archivos necesarios para el desarrollo y despliegue del panel.

- **`firebase/`**  
  Carpeta dedicada a la configuración de **Firebase**, incluyendo:
  - Reglas de seguridad (`firestore.rules`)
  - Configuración de hosting
  - Scripts de inicialización (si aplica)

- **Archivos Raíz**  
  Incluyen archivos de configuración general del repositorio como `package.json`, `.gitignore`, y este `README.md`.

---

## Instrucciones de Instalación y Ejecución

### 1. Aplicación Móvil (`mobile-app`)

1. **Navega al directorio `mobile-app`:**
   ```bash
   cd mobile-app
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Ejecuta la aplicación en modo desarrollo:**
   ```bash
   npm start
   ```

4. **Abre tu navegador y visita:**
   [http://localhost:8100/](http://localhost:8100/) para ver la aplicación.

---

### 2. Panel de Administración Web (`web-admin`)

1. **Navega al directorio `web-admin`:**
   ```bash
   cd web-admin
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Ejecuta la aplicación en modo desarrollo:**
   ```bash
   npm start
   ```

4. **Abre tu navegador y visita:**
   [http://localhost:4200/](http://localhost:4200/) para ver la aplicación.

---

## Consideraciones Adicionales

- **Variables de Entorno:**  
  Si el proyecto requiere configuraciones específicas (como claves de API, endpoints o configuración de Firebase), revisa la documentación interna o los archivos `.env` correspondientes.

- **Scripts Útiles en `package.json`:**  
  Además de `npm start`, puedes encontrar scripts como `build`, `test`, `lint` o `deploy` que ayudan durante el desarrollo y despliegue. Revisa el `package.json` de cada proyecto.

- **Actualización de la Documentación:**  
  Si se modifica la estructura del proyecto o se agregan nuevas funcionalidades, recuerda actualizar este archivo `README.md`.

