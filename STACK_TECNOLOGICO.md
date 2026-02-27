# Stack Tecnológico del Proyecto (qrtostl)

# PRUEBITA

Este documento detalla las tecnologías, frameworks y librerías clave utilizadas en el desarrollo de este proyecto, basado en las dependencias declaradas en el `package.json` y la estructura del proyecto.

## 🏗️ Core & Framework

*   **[Next.js](https://nextjs.org/) (v16.1.6)**: Framework principal de React para la construcción de la interfaz de usuario, renderizado SSR/SSG y enrutamiento (App Router).
*   **[React](https://react.dev/) (v19)**: Librería principal para la construcción de componentes de interfaces de usuario.
*   **[TypeScript](https://www.typescriptlang.org/) (v5.7.3)**: Superset de JavaScript que añade tipado estático, mejorando la mantenibilidad y la experiencia de desarrollo.
*   **[Node.js](https://nodejs.org/)**: Entorno de ejecución subyacente para el servidor de desarrollo y la construcción (configurado con tipos para la v22).

## 🎨 Estilos y Diseño UI

*   **[Tailwind CSS](https://tailwindcss.com/) (v3.4.17)**: Framework de CSS utilitario para la estilización rápida, escalable y responsiva. Integrado usando PostCSS.
*   **[shadcn/ui](https://ui.shadcn.com/)**: Colección de componentes de interfaz de usuario reusables y accesibles. Se identifica por la presencia de `components.json`, la librería de utilidades de clases (`clsx`, `tailwind-merge`, `class-variance-authority`) y múltiples primitivas.
*   **[Radix UI](https://www.radix-ui.com/)**: Componentes primitivos sin estilos (headless) subyacentes en la mayoría de los elementos interactivos complejos de la UI (Accordion, Dialog, Select, Menu, Toolbar, Scroll Area, etc.) enfocados fuertemente en la accesibilidad.
*   **[Lucide React](https://lucide.dev/)**: Librería de iconos vectoriales limpios y consistentes.
*   **[Next Themes](https://github.com/pacocoursey/next-themes)**: Gestión de temas (Light/Dark mode) sin destellos durante el renderizado inicial en Next.js.
*   **[Tailwind CSS Animate](https://github.com/jamiebuilds/tailwindcss-animate)**: Plugin de Tailwind para añadir animaciones y transiciones de UI comunes.

## 🧊 Gráficos 3D

*   **[Three.js](https://threejs.org/) (v0.182.0)**: Librería principal de JavaScript para gráficos 3D interactivos en el navegador usando WebGL.
*   **[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) (v9.5.0)**: Renderizador de React que permite construir escenas de Three.js de manera declarativa con componentes React.
*   **[@react-three/drei](https://github.com/pmndrs/drei) (v10.7.7)**: Colección de utilidades, helpers y abstracciones extensas que facilitan el desarrollo en React Three Fiber (cámaras, controles de órbita, texturas, formas, iluminación, etc.).

## 🛠️ Utilidades y Funcionalidades Específicas

*   **[QRCode](https://github.com/soldair/node-qrcode)**: Herramienta de generación de códigos QR (presumiblemente para el uso central de la app `qrtostl`).
*   **[React Hook Form](https://react-hook-form.com/)**: Gestión avanzada del estado y validación de formularios de manera eficiente y con pocas re-renderizaciones.
*   **[Zod](https://zod.dev/)**: Declaración de esquemas y validación de datos fuertemente tipada (integrado de la mano con React Hook Form a través de `@hookform/resolvers`).
*   **[Date-fns](https://date-fns.org/)**: Herramientas utilitarias puras para el formateo, manipulación y comparación de fechas.
*   **[Recharts](https://recharts.org/)**: Sistema de visualización de datos y gráficos componibles basados en React y D3 (gráficos de barras, líneas, área, etc.).
*   **[Sonner](https://sonner.emilkowal.ski/)**: Librería nativa y optimizada para notificaciones tipo "toast" altamente customizables.
*   **[React Day Picker](https://react-day-picker.js.org/)**: Componente robusto para la selección de fechas y creación de calendarios (frecuentemente combinado con popovers).
*   **[Embla Carousel React](https://www.embla-carousel.com/)**: Motor de carruseles fluido, accesible y responsivo.
*   **[Vaul](https://vaul.emilkowal.ski/)**: Componente tipo "Drawer" (panel inferior que se despliega) sin estilo, especialmente optimizado para interacciones táctiles y gestos móviles.
*   **[React Resizable Panels](https://github.com/bvaughn/react-resizable-panels)**: Librería para interfaces con paneles redimensionables arrastrando desde el área designada (drag and drop).
*   **[Input OTP](https://github.com/guilhermerodz/input-otp)**: Componente especializado para la ingesta de códigos One-Time Password de alta fidelidad.
*   **[CMDK](https://cmdk.paco.me/)**: Menú de comandos / paleta de búsqueda rápida accesible para React.

## ⚙️ Entorno de Desarrollo y Configuración

*   **Gestión de Paquetes**: El proyecto cuenta tanto con `package-lock.json` (probablemente para dependencias estándar de npm) así como `pnpm-lock.yaml`, indicando un uso potencial del gestor **pnpm** para instalaciones más veloces y eficientes.
*   **ESLint / TypeScript**: Análisis estático de código por defecto configurado directamente a través de Next.js (`next lint`) junto asercciones estrictas del compilador TypeScript.
