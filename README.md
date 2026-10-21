# Panadería y Pastelería William — Cajamarca

Sitio web estático (solo HTML, CSS y JavaScript, sin build ni dependencias locales) alojado en GitHub Pages:

**https://brayan44959.github.io/bakery-website/**

## Estructura del proyecto

```
├── index.html            → Página de inicio
├── 404.html              → Página de error personalizada de GitHub Pages
├── pages/
│   ├── productos.html    → Catálogo completo con filtros y búsqueda
│   ├── novedades.html    → Lanzamientos y especiales de temporada
│   ├── historia.html     → Historia, pilares y línea de tiempo
│   ├── pedidos.html      → Generador de pedidos por WhatsApp
│   ├── pagos.html        → Métodos de pago (Yape, Plin, BCP, efectivo)
│   └── contacto.html     → Contacto, mapa y formulario rápido
├── css/styles.css        → Todos los estilos del sitio
├── js/data.js            → ⭐ CONFIGURACIÓN y catálogo de productos
├── js/app.js             → Lógica: carrito, pedidos, filtros, modal, WhatsApp
└── img/                  → Fotografías del local y productos
    └── productos/        → Imágenes del catálogo actual
```

## Cómo actualizar el contenido

Casi todo se administra desde **`js/data.js`**:

- **`CONFIG`**: teléfono de WhatsApp (formato `51XXXXXXXXX`), dirección, horarios
  (`HORARIO_MANANA` y `HORARIO_TARDE`), números de Yape/Plin/BCP, enlace del mapa y redes sociales.
- **`PRODUCTS`**: catálogo completo (nombre, precio, unidad, descripción, imagen, destacado).
  El catálogo actual tiene 9 productos: pan torta, pan de agua, pan de yema, pan integral,
  bizcochos, pan cachito con manjar, rosquitas, galletas de avena y queque.
  Los panes se venden por paquete: 5 unidades por S/ 1.00 (pan de agua y pan torta) y
  4 unidades por S/ 1.00 (pan de yema, integral, bizcochos y cachito con manjar).
  Las rosquitas se venden en bolsa de 1/2 kg por S/ 6.00.
- **`COMBOS`**: promociones. Cada combo define sus productos (`items`) y su precio final;
  el ahorro se calcula solo comparando con la suma de precios normales.
- **`TESTIMONIALS`**: opiniones de clientes que aparecen en el inicio.

Los carritos guardados en el navegador de los clientes se **sincronizan automáticamente**
con estos datos: si cambias un precio, los pedidos pendientes se actualizan solos.

### Imágenes de productos

Las fotos del catálogo actual están en `img/productos/` y fueron optimizadas para la web.
Puedes reemplazarlas por fotos reales manteniendo el mismo nombre de archivo. La portada
de Novedades usa `img/productos/queque.jpg` para mostrar el queque casero.


## Notas de despliegue

- No requiere compilación: subir los archivos al repositorio y GitHub Pages sirve todo.
- Los enlaces internos son relativos y las rutas de archivos en minúsculas (compatible
  con la sensibilidad a mayúsculas de GitHub Pages).
- Únicas dependencias externas: Google Fonts y el mapa embebido de Google Maps.
  Si no cargan, el sitio sigue funcionando con tipografías del sistema y un recuadro vacío.
- El carrito se guarda en `localStorage` de cada visitante (no hay servidor ni base de datos).

## Animaciones y movimiento

- La portada incluye una bienvenida animada (zoom lento de la foto principal, tarjetas
  flotantes y cinta de mensajes en movimiento) y las secciones aparecen suavemente al
  hacer scroll.
- Todo el movimiento respeta la preferencia del sistema **`prefers-reduced-motion`**.
- No se agregaron librerías externas: las animaciones son CSS y JavaScript nativo.

