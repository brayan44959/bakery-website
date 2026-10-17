/* ==========================================================================
   PANADERÍA Y PASTELERÍA WILLIAM - CAJAMARCA (DESDE 2000)
   Configuración editable y catálogo completo de productos
   ========================================================================== */

const CONFIG = {
  // WhatsApp: Dígitos con código de país (51 para Perú). Ej: "51976000000"
  WHATSAPP: "51976123456",
  PHONE_DISPLAY: "+51 976 123 456",
  PHONE_LANDLINE: "(076) 364 892",
  EMAIL: "pedidos@panaderiawilliam.pe",
  
  // Dirección y ubicación
  ADDRESS: "Urbanización El Amauta, Jr. Chanchamayo N.° 1874",
  CITY: "Cajamarca, Perú",
  MAPS_QUERY: "Jr. Chanchamayo 1874, Urb. El Amauta, Cajamarca, Perú",
  MAPS_EMBED: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.468846313524!2d-78.5135118!3d-7.1610488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91b25afc0c000001%3A0x1!2sJr.%20Chanchamayo%201874%2C%20Cajamarca!5e0!3m2!1ses!2spe!4v1710000000000!5m2!1ses!2spe",
  
  // Redes sociales
  FACEBOOK: "https://facebook.com",
  INSTAGRAM: "https://instagram.com",
  TIKTOK: "https://tiktok.com",
  
  // Horarios de atención y salida de pan caliente
  HORARIOS_SEMANA: "Lunes a Sábado: 6:00 AM - 9:30 PM",
  HORARIOS_DOMINGO: "Domingos: 6:30 AM - 9:00 PM",
  PAN_CALIENTE_MANANA: "6:30 AM",
  PAN_CALIENTE_TARDE: "4:45 PM",
  
  // Datos de pago digital
  YAPE_TITULAR: "William M. - Panadería William",
  YAPE_NUMERO: "976 123 456",
  PLIN_NUMERO: "976 123 456",
  BCP_CUENTA: "245-98765432-0-18 (Soles)",
  BCP_CCI: "002-245-0098765432018-92",
  
  HERO_IMG: "img/hero.jpg"
};

/* ===== CATÁLOGO COMPLETO DE PRODUCTOS ===== */
const PRODUCTS = [
  {
    id: "pan-de-agua",
    name: "Pan de agua tradicional",
    cats: ["panes"],
    badge: "Más vendido",
    badgeType: "hot",
    desc: "El pan de todos los días en Cajamarca. Corteza dorada y crocante, miga suave y aireada recién salido del horno.",
    details: "Elaborado con harina de trigo seleccionada, fermentación paciente y horneado a la piedra. Ideal para el desayuno familiar con queso cajamarquino, mantequilla o palta.",
    price: 0.40,
    unit: "unidad",
    img: "img/pan-de-agua.jpg",
    destacado: true
  },
  {
    id: "pan-de-yema",
    name: "Pan de yema con ajonjolí",
    cats: ["panes"],
    badge: "Favorito",
    badgeType: "gold",
    desc: "Dorado, tierno y con aroma irresistible. Masa enriquecida con huevo fresco y coronado con semillas de ajonjolí tostadas.",
    details: "Textura sumamente suave y esponjosa con un toque sutilmente dulce. Un clásico de nuestra panadería que acompaña de forma perfecta cualquier bebida caliente.",
    price: 0.50,
    unit: "unidad",
    img: "img/pan-de-yema.jpg",
    destacado: true
  },
  {
    id: "pan-torta",
    name: "Pan torta artesanal",
    cats: ["panes"],
    badge: "Receta 2000",
    badgeType: "classic",
    desc: "Uno de los primeros panes creados en la casa hace más de dos décadas. Redondo, esponjoso y de miga noble.",
    details: "Receta familiar tradicional que conserva el sabor original con el que abrimos nuestras puertas en el 2000. Textura consistente y durabilidad excelente.",
    price: 0.50,
    unit: "unidad",
    img: "img/pan-torta.jpg",
    destacado: false
  },
  {
    id: "pan-integral",
    name: "Pan integral de semillas",
    cats: ["panes"],
    badge: "100% Saludable",
    badgeType: "green",
    desc: "Miga rústica y nutritiva elaborada con harina integral, salvado fino, linaza y copos de avena tostada.",
    details: "Rico en fibra natural y de fermentación lenta para favorecer la digestión. Corteza crujiente con semillas que aportan textura y nutrientes esenciales.",
    price: 0.60,
    unit: "unidad",
    img: "img/pan-integral.jpg",
    destacado: false
  },
  {
    id: "molletes",
    name: "Molletes cajamarquinos",
    cats: ["panes", "dulces"],
    badge: "Tradicional",
    badgeType: "classic",
    desc: "Pancitos suaves y tiernos con un delicado toque aromático de anís y fina lluvia de azúcar en la superficie.",
    details: "Bocado tradicional de la sierra norteña del Perú. Suaves como una almohada, ideales para acompañar chocolate caliente o café de altura.",
    price: 0.60,
    unit: "unidad",
    img: "img/molletes.jpg",
    destacado: false
  },
  {
    id: "rosquitas",
    name: "Rosquitas cajamarquinas",
    cats: ["dulces", "especialidades"],
    badge: "Símbolo de Cajamarca",
    badgeType: "gold",
    desc: "El sabor inconfundible de nuestra tierra. Crocantes, doradas, amasadas con manteca de primera y horneadas a fuego lento.",
    details: "Orgullo gastronómico de Cajamarca. Elaboradas siguiendo la técnica tradicional para lograr esa textura crocante y sabor inconfundible. Perfectas para compartir o llevar de viaje.",
    price: 6.00,
    unit: "bolsa (12 unidades)",
    img: "img/rosquitas.jpg",
    destacado: true
  },
  {
    id: "bizcochos",
    name: "Bizcochos hojaldrados con canela",
    cats: ["dulces", "pasteleria"],
    badge: "Para el lonche",
    badgeType: "sweet",
    desc: "Masa dulce dorada y hojaldrada, con espirales de canela, pasas selectas y glaseado sutil recién horneado.",
    details: "El favorito de las tardes en Cajamarca. Al morderlos se siente la combinación aromática de la canela y la masa mantecosa y ligera.",
    price: 0.80,
    unit: "unidad",
    img: "img/bizcochos.jpg",
    destacado: false
  },
  {
    id: "donas",
    name: "Donas artesanales surtidas",
    cats: ["dulces"],
    badge: "Recién hechas",
    badgeType: "hot",
    desc: "Esponjosas y deliciosas. Disponibles con glaseado clásico de vainilla, cobertura de chocolate y chispas de colores.",
    details: "Fritura ligera y masa fermentada al punto exacto para que resulten aireadas y no grasosas. Cobertura con chocolate de repostería fina.",
    price: 2.50,
    unit: "unidad",
    img: "img/donas.jpg",
    destacado: false
  },
  {
    id: "cachitos",
    name: "Cachitos de mantequilla hojaldrados",
    cats: ["dulces", "especialidades"],
    badge: "Crujiente",
    badgeType: "gold",
    desc: "Cachitos estilo croissant, con capas doradas y crocantes por fuera y masa tierna con pura mantequilla por dentro.",
    details: "Elaborados con técnica de laminado paciente, logrando capas visibles y un aroma irresistible al salir del horno.",
    price: 1.50,
    unit: "unidad",
    img: "img/empanadas.jpg",
    destacado: false
  },
  {
    id: "galletas-avena",
    name: "Galletas rústicas de avena y chispas",
    cats: ["dulces", "especialidades"],
    badge: "Artesanal",
    badgeType: "green",
    desc: "Crocantes galletas horneadas con hojuelas de avena entera, trozos de chocolate y una pizca de canela.",
    details: "Proceso 100% artesanal sin preservantes ni colorantes. Textura crujiente en los bordes y corazón ligeramente tierno.",
    price: 4.50,
    unit: "bolsa (6 unidades)",
    img: "img/galletas-avena.jpg",
    destacado: false
  },
  {
    id: "pasteles",
    name: "Pastel artesanal de celebración",
    cats: ["pasteleria"],
    badge: "A pedido",
    badgeType: "gold",
    desc: "Tortas decoradas para cumpleaños y reuniones familiares. Bizcochuelo húmedo, fudge artesanal y crema chantilly.",
    details: "Elaboramos pasteles en diversos tamaños y sabores: Chocolate Supremo, Tres Leches clásico, Vainilla con fresas y Selva Negra. Coordinación personalizada por WhatsApp.",
    price: 45.00,
    unit: "entero (12 a 15 porciones)",
    img: "img/pasteles.jpg",
    destacado: true
  },
  {
    id: "queque",
    name: "El queque casero de William",
    cats: ["dulces", "pasteleria"],
    badge: "Especial de la casa",
    badgeType: "hot",
    desc: "Nuestra creación especial con naranja natural y vainilla, textura sumamente húmeda, suave y esponjosa.",
    details: "Horneado en molde tradicional corona. Receta secreta de la familia William que rescata los aromas caseros de la infancia. Se vende entero o por porciones.",
    price: 18.00,
    unit: "molde entero corona",
    img: "img/queque.jpg",
    destacado: false
  },
  {
    id: "cupcakes",
    name: "Cupcakes finos con crema y frutas",
    cats: ["dulces", "pasteleria"],
    badge: "Bocaditos",
    badgeType: "sweet",
    desc: "Delicados panquecitos individuales coronados con crema suave de vainilla, chocolate blanco y frutas frescas.",
    details: "Ideales para mesas de dulces, cumpleaños infantiles, lonches especiales y detalles sorpresa.",
    price: 3.50,
    unit: "unidad",
    img: "img/alfajores.jpg",
    destacado: false
  }
];

/* ===== COMBOS Y PROMOCIONES ===== */
const COMBOS = [
  {
    id: "combo-desayuno",
    name: "Desayuno Cajamarquino Familiar",
    desc: "6 Panes de agua crocantes + 4 Panes de yema dorados + 1 Bolsa de Rosquitas Cajamarquinas.",
    price: 9.50,
    saving: "Ahorra S/ 1.00",
    badge: "El más pedido"
  },
  {
    id: "combo-lonche",
    name: "Lonche Dulce de la Tarde",
    desc: "4 Bizcochos con canela + 2 Donas artesanales + 4 Molletes tradicionales.",
    price: 9.80,
    saving: "Ideal para 4 personas",
    badge: "Para compartir"
  },
  {
    id: "combo-tradicion",
    name: "Pack Regalo de Tradición",
    desc: "2 Bolsas de Rosquitas Cajamarquinas + 1 Queque casero entero de William.",
    price: 28.00,
    saving: "El favorito de los viajeros",
    badge: "Para regalar"
  }
];

/* ===== TESTIMONIOS REALES ===== */
const TESTIMONIALS = [
  {
    name: "María Elena Rodríguez",
    neighborhood: "Barrio San Sebastián, Cajamarca",
    stars: 5,
    comment: "El pan de agua recién salido a las 6:30 de la mañana no tiene comparación en todo Cajamarca. Crocante por fuera y suave por dentro. Mis hijos no quieren desayunar otro pan."
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
    comment: "Mandamos a hacer la torta de cumpleaños de mi mamá y todos los invitados quedaron fascinados. Muy fresca, nada empalagosa y la entrega fue súper puntual. 100% recomendados."
  }
];
