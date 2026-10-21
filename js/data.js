/* ==========================================================================
   PANADERÍA Y PASTELERÍA WILLIAM - CAJAMARCA (DESDE 2000)
   Configuración editable y catálogo completo de productos
   ========================================================================== */

const CONFIG = {
  // WhatsApp: Dígitos con código de país (51 para Perú). Ej: "51987612172"
  WHATSAPP: "51987612172",
  PHONE_DISPLAY: "+51 987 612 172",
  PHONE_LANDLINE: "(076) 364 892",
  EMAIL: "pedidos@panaderiawilliam.pe",

  // Dirección y ubicación
  ADDRESS: "Jr. Chanchamayo N.° 1874, Urb. El Amauta, Cajamarca",
  CITY: "Cajamarca, Perú",
  MAPS_QUERY: "Jr. Chanchamayo 1874, Urb. El Amauta, Cajamarca, Perú",
  MAPS_EMBED: "https://www.google.com/maps?q=Jr.%20Chanchamayo%201874%2C%20Urb.%20El%20Amauta%2C%20Cajamarca%2C%20Per%C3%BA&z=16&hl=es&output=embed",

  // Redes sociales
  FACEBOOK: "https://facebook.com",
  INSTAGRAM: "https://instagram.com",
  TIKTOK: "https://tiktok.com",

  // Horarios de atención (dos turnos diarios) y salida de pan caliente
  HORARIO_MANANA: "4:30 AM - 10:00 AM",
  HORARIO_TARDE: "4:00 PM - 9:00 PM",
  HORARIOS_SEMANA: "4:30 AM - 10:00 AM / 4:00 PM - 9:00 PM",
  HORARIOS_DOMINGO: "4:30 AM - 10:00 AM / 4:00 PM - 9:00 PM",
  PAN_CALIENTE_MANANA: "4:30 AM",
  PAN_CALIENTE_TARDE: "4:00 PM",

  // Datos de pago digital
  YAPE_TITULAR: "William M. - Panadería William",
  YAPE_NUMERO: "987 612 172",
  PLIN_NUMERO: "987 612 172",
  BCP_CUENTA: "245-98765432-0-18 (Soles)",
  BCP_CCI: "002-245-0098765432018-92",
  PLIN_TITULAR: "William M. - Panadería William",
  BCP_TITULAR: "Panadería y Pastelería William",

  HERO_IMG: "img/hero.jpg"
};

/* ===== CATÁLOGO COMPLETO DE PRODUCTOS =====
   Los panes se venden por paquete:
   - 5 unidades por S/ 1.00 (pan de agua y pan torta)
   - 4 unidades por S/ 1.00 (pan de yema, integral, bizcochos, cachito con manjar y relleno)
   - Rosquitas: bolsa de 1/2 kg por S/ 6.00
*/
const PRODUCTS = [
  {
    id: "pan-torta",
    name: "Pan torta artesanal",
    cats: ["panes"],
    badge: "El más vendido",
    badgeType: "hot",
    desc: "Es el clásico indiscutible de la casa desde sus inicios. Redondo, esponjoso y de miga noble. Paquete de 5 panes por S/ 1.00.",
    details: "Receta familiar tradicional que conserva el sabor original con el que abrimos nuestras puertas en el 2000. Textura consistente y durabilidad excelente. Se vende en paquete de 5 unidades.",
    price: 1.00,
    unit: "paquete de 5 panes",
    img: "img/productos/pan-torta.jpg",
    destacado: true
  },
  {
    id: "pan-de-agua",
    name: "Pan de agua tradicional",
    cats: ["panes"],
    badge: "Tradicional",
    badgeType: "classic",
    desc: "Representa el pan de mesa diario y tradicional de Cajamarca, caracterizado por su horneado diario en horno artesanal. Corteza dorada y miga suave. Paquete de 5 panes por S/ 1.00.",
    details: "Elaborado con harina de trigo seleccionada, fermentación paciente y horneado a la piedra. Ideal para el desayuno familiar con queso cajamarquino, mantequilla o palta. Se vende en paquete de 5 unidades.",
    price: 1.00,
    unit: "paquete de 5 panes",
    img: "img/productos/pan-de-agua.jpg",
    destacado: true
  },
  {
    id: "pan-integral",
    name: "Pan integral de semillas",
    cats: ["panes"],
    badge: "Opción saludable",
    badgeType: "green",
    desc: "El pan integral está enfocado en los consumidores que buscan cuidar su alimentación, mantener una dieta equilibrada o consumir fibra. Paquete de 4 panes por S/ 1.00.",
    details: "Rico en fibra natural y de fermentación lenta para favorecer la digestión. Corteza crujiente con semillas que aportan textura y nutrientes esenciales. Se vende en paquete de 4 unidades.",
    price: 1.00,
    unit: "paquete de 4 panes",
    img: "img/productos/pan-integral.jpg",
    destacado: true
  },
  {
    id: "pan-de-yema",
    name: "Pan de yema con ajonjolí",
    cats: ["panes"],
    badge: "Favorito del lonche",
    badgeType: "gold",
    desc: "Dorado, tierno y con aroma irresistible. Masa enriquecida con huevo fresco y coronado con semillas de ajonjolí tostadas. Paquete de 4 panes por S/ 1.00.",
    details: "Textura sumamente suave y esponjosa con un toque sutilmente dulce. Un clásico de nuestra panadería que acompaña de forma perfecta cualquier bebida caliente. Se vende en paquete de 4 unidades.",
    price: 1.00,
    unit: "paquete de 4 panes",
    img: "img/productos/pan-de-yema.jpg",
    destacado: true
  },
  {
    id: "bizcochos",
    name: "Bizcochos hojaldrados con canela",
    cats: ["panes", "dulces"],
    badge: "Para el café",
    badgeType: "sweet",
    desc: "Altamente solicitados para acompañar el café o el lonche de la tarde en familia. Masa dulce dorada y hojaldrada, con espirales de canela y pasas. Paquete de 4 bizcochos por S/ 1.00.",
    details: "El favorito de las tardes en Cajamarca. Al morderlos se siente la combinación aromática de la canela y la masa mantecosa y ligera. Se vende en paquete de 4 unidades.",
    price: 1.00,
    unit: "paquete de 4 bizcochos",
    img: "img/productos/bizcochos.jpg",
    destacado: true
  },
  {
    id: "rosquitas",
    name: "Rosquitas cajamarquinas",
    cats: ["dulces", "especialidades"],
    badge: "Especial de la casa",
    badgeType: "gold",
    desc: "El sabor inconfundible de nuestra tierra. Crocantes, doradas y horneadas a fuego lento. Bolsa de 1/2 kg por S/ 6.00.",
    details: "Orgullo gastronómico de Cajamarca. Elaboradas siguiendo la técnica tradicional para lograr esa textura crocante y sabor inconfundible. Perfectas para compartir o llevar de viaje. Se vende en bolsa de 1/2 kg.",
    price: 6.00,
    unit: "bolsa de 1/2 kg",
    img: "img/productos/rosquitas.jpg",
    destacado: true
  },
  {
    id: "pan-cachito-manjar",
    name: "Pan cachito con manjar",
    cats: ["panes", "dulces"],
    badge: "Nuevo",
    badgeType: "sweet",
    desc: "Panecillo tierno en forma de cachito, relleno con manjar blanco casero y espolvoreado con azúcar. Paquete de 4 panes por S/ 1.00.",
    details: "Masa dulce de fermentación lenta, rellena generosamente con manjar blanco preparado en casa. El compañero perfecto para el café o el chocolate de la tarde. Se vende en paquete de 4 unidades.",
    price: 1.00,
    unit: "paquete de 4 panes",
    img: "img/productos/pan-cachito-manjar.jpg",
    destacado: false
  },
  {
    id: "pan-relleno",
    name: "Pan relleno de la casa",
    cats: ["panes"],
    badge: "Recién horneado",
    badgeType: "hot",
    desc: "Panecillo dorado y esponjoso con el relleno casero de la casa, recién salido del horno artesanal. Paquete de 4 panes por S/ 1.00.",
    details: "Elaborado con nuestra masa madre y un relleno preparado diariamente. Ideal para el desayuno o el lonche, acompañado de una bebida caliente. Se vende en paquete de 4 unidades.",
    price: 1.00,
    unit: "paquete de 4 panes",
    img: "img/productos/pan-relleno.jpg",
    destacado: false
  },
  {
    id: "galletas-avena",
    name: "Galletas rústicas de avena y chispas",
    cats: ["dulces", "especialidades"],
    badge: "Artesanal",
    badgeType: "green",
    desc: "Crocantes galletas horneadas con hojuelas de avena entera, trozos de chocolate y una pizca de canela. Ideales para el café o el lonche.",
    details: "Proceso 100% artesanal sin preservantes ni colorantes. Textura crujiente en los bordes y corazón ligeramente tierno. Bolsa de 6 unidades por S/ 4.50.",
    price: 4.50,
    unit: "bolsa (6 unidades)",
    img: "img/productos/galletas-avena.jpg",
    destacado: false
  },
  {
    id: "queque",
    name: "El queque casero de William",
    cats: ["dulces", "pasteleria"],
    badge: "Nuevo lanzamiento",
    badgeType: "hot",
    desc: "Nuestra creación especial con naranja natural y vainilla, textura sumamente húmeda, suave y esponjosa. Molde entero por S/ 18.00.",
    details: "Horneado en molde tradicional corona. Receta secreta de la familia William que rescata los aromas caseros de la infancia. Se vende entero o por porciones.",
    price: 18.00,
    unit: "molde entero corona",
    img: "img/productos/queque.jpg",
    destacado: false
  }
];

/* ===== COMBOS Y PROMOCIONES =====
   Los precios de los combos se comparan automáticamente con la suma
   de sus productos para mostrar el ahorro al cliente.
*/
const COMBOS = [
  {
    id: "combo-desayuno",
    name: "Desayuno Cajamarquino",
    desc: "10 panes de agua + 5 panes torta + 4 panes de yema recién horneados para compartir en familia.",
    items: [
      { id: "pan-de-agua", qty: 2 },
      { id: "pan-torta", qty: 1 },
      { id: "pan-de-yema", qty: 1 }
    ],
    price: 3.50,
    note: "19 panes para toda la familia",
    badge: "El más pedido"
  },
  {
    id: "combo-lonche",
    name: "Lonche Criollo",
    desc: "8 bizcochos con canela + 4 panes cachito con manjar + 4 panes rellenos de la casa.",
    items: [
      { id: "bizcochos", qty: 2 },
      { id: "pan-cachito-manjar", qty: 1 },
      { id: "pan-relleno", qty: 1 }
    ],
    price: 3.50,
    note: "Nuevo combo de la tarde",
    badge: "Nuevo"
  },
  {
    id: "combo-tradicion",
    name: "Pack Regalo de Tradición",
    desc: "1 bolsa de rosquitas cajamarquinas (1/2 kg) + 1 queque casero entero + 4 bizcochos.",
    items: [
      { id: "rosquitas", qty: 1 },
      { id: "queque", qty: 1 },
      { id: "bizcochos", qty: 1 }
    ],
    price: 22.90,
    note: "El preferido por los viajeros",
    badge: "Para regalar"
  }
];

/* ===== TESTIMONIOS REALES ===== */
const TESTIMONIALS = [
  {
    name: "María Elena Rodríguez",
    neighborhood: "Barrio San Sebastián, Cajamarca",
    stars: 5,
    comment: "El pan de agua recién salido a las 4:30 de la mañana no tiene comparación en todo Cajamarca. Crocante por fuera y suave por dentro. Mis hijos no quieren desayunar otro pan."
  },
  {
    name: "Carlos Mendoza Silva",
    neighborhood: "Urb. El Amauta, Cajamarca",
    stars: 5,
    comment: "Soy cliente desde el año 2002. La atención familiar de don William y su equipo es de primera. Las rosquitas y el pan de yema mantienen exactamente la misma calidad que hace 20 años."
  },
  {
    name: "Lucía Terrones",
    neighborhood: "Jr. Chanchamayo, Cajamarca",
    stars: 5,
    comment: "Mandamos a hacer el queque casero para el cumpleaños de mi mamá y todos los invitados quedaron fascinados. Muy fresco, nada empalagoso y la atención fue súper amable. 100% recomendados."
  }
];
