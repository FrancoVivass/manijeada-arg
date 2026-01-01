export interface MimicCategory {
  id: string;
  name: string;
  icon: string;
  words: string[];
}

export const MIMIC_CATEGORIES: MimicCategory[] = [
  // 🏠 OBJETOS DEL HOGAR
  {
    id: 'hogar',
    name: 'OBJETOS DEL HOGAR',
    icon: 'home',
    words: [
      'Televisor', 'Refrigerador', 'Microondas', 'Lavadora', 'Secadora', 'Aspiradora',
      'Cafetera', 'Tostadora', 'Licuadora', 'Plancha', 'Planchita', 'Secador de Pelo',
      'Ducha', 'Inodoro', 'Lavabo', 'Espejo', 'Cama', 'Almohada', 'Cobija', 'Sábana',
      'Mesa', 'Silla', 'Sofá', 'Alfombra', 'Cortinas', 'Estantería', 'Lámpara', 'Velador',
      'Puerta', 'Ventana', 'Escalera', 'Ascensor', 'Garaje', 'Jardín', 'Piscina',
      'Barbacoa', 'Hamaca', 'Mesa de Ping Pong', 'Bicicleta Estática', 'Máquina de Coser'
    ]
  },

  // 🎬 PELÍCULAS Y PERSONAJES
  {
    id: 'peliculas',
    name: 'PELÍCULAS Y PERSONAJES',
    icon: 'film',
    words: [
      'Harry Potter', 'Frodo', 'Gandalf', 'Luke Skywalker', 'Darth Vader', 'Yoda',
      'Iron Man', 'Thor', 'Hulk', 'Capitán América', 'Spiderman', 'Batman',
      'Superman', 'Wonder Woman', 'Aquaman', 'Flash', 'Joker', 'Harley Quinn',
      'James Bond', 'Indiana Jones', 'Han Solo', 'Leia Organa', 'Chewbacca',
      'Mary Poppins', 'Peter Pan', 'Cenicienta', 'Blancanieves', 'Bella', 'Edward',
      'Jack Sparrow', 'Will Turner', 'Elizabeth Swann', 'Davy Jones', 'Tiburón',
      'Forrest Gump', 'Rocky Balboa', 'Terminator', 'Rambo', 'Conan', 'Predator'
    ]
  },

  // 🎵 CANCIONES Y ARTISTAS
  {
    id: 'musica',
    name: 'CANCIONES Y ARTISTAS',
    icon: 'music',
    words: [
      'Michael Jackson', 'Madonna', 'Elvis Presley', 'The Beatles', 'Queen',
      'Freddie Mercury', 'David Bowie', 'Prince', 'Whitney Houston', 'Mariah Carey',
      'Celine Dion', 'Shakira', 'Rihanna', 'Lady Gaga', 'Beyoncé', 'Bruno Mars',
      'Ed Sheeran', 'Taylor Swift', 'Ariana Grande', 'Justin Bieber', 'Katy Perry',
      'Thriller', 'Billie Jean', 'Beat It', 'Black or White', 'Bad Romance',
      'Poker Face', 'Born This Way', 'Rolling in the Deep', 'Someone Like You',
      'Hello', 'Shape of You', 'Uptown Funk', 'Happy', 'Can\'t Stop the Feeling'
    ]
  },

  // ⚽ DEPORTES Y ATLETAS
  {
    id: 'deportes',
    name: 'DEPORTES Y ATLETAS',
    icon: 'soccer',
    words: [
      'Messi', 'Cristiano Ronaldo', 'Neymar', 'Mbappé', 'Hazard', 'De Bruyne',
      'Modric', 'Benzema', 'Haaland', 'Lewandowski', 'Kane', 'Son', 'Salah',
      'Bale', 'Pogba', 'Griezmann', 'Pedri', 'Gavi', 'Ansu Fati', 'Vinicius',
      'Fútbol', 'Baloncesto', 'Tenis', 'Natación', 'Atletismo', 'Ciclismo',
      'Fórmula 1', 'Motociclismo', 'Boxeo', 'Karate', 'Judo', 'Taekwondo',
      'Golf', 'Béisbol', 'Béisbol Americano', 'Hockey', 'Rugby', 'Críquet',
      'Voleibol', 'Handball', 'Waterpolo', 'Esquí', 'Snowboard', 'Surf'
    ]
  },

  // 🐾 ANIMALES
  {
    id: 'animales',
    name: 'ANIMALES',
    icon: 'paw',
    words: [
      'Perro', 'Gato', 'Caballo', 'Vaca', 'Cerdo', 'Oveja', 'Gallina', 'Pato',
      'Conejo', 'Conejo', 'Ratón', 'Rata', 'Elefante', 'Jirafa', 'León', 'Tigre',
      'Leopardo', 'Pantera', 'Oso', 'Oso Panda', 'Koala', 'Mono', 'Gorila',
      'Chimpancé', 'Delfín', 'Ballena', 'Tiburón', 'Pez Payaso', 'Pulpo',
      'Calamar', 'Medusa', 'Tortuga', 'Cocodrilo', 'Serpiente', 'Araña',
      'Escorpión', 'Mariposa', 'Abeja', 'Mosquito', 'Mosca', 'Hormiga',
      'Águila', 'Cóndor', 'Búho', 'Lechuza', 'Paloma', 'Cuervo', 'Gaviota',
      'Pingüino', 'Flamenco', 'Pavo Real', 'Pájaro', 'Canario', 'Loro'
    ]
  },

  // 🍔 COMIDA Y BEBIDA
  {
    id: 'comida',
    name: 'COMIDA Y BEBIDA',
    icon: 'hamburger',
    words: [
      'Pizza', 'Hamburguesa', 'Hot Dog', 'Tacos', 'Burritos', 'Enchiladas',
      'Pasta', 'Espaguetis', 'Lasaña', 'Ravioles', 'Sushi', 'Sashimi',
      'Temaki', 'Nigiri', 'Arroz', 'Fideos', 'Pollo con Papas', 'Milanesa',
      'Asado', 'Parrillada', 'Churrasco', 'Ceviche', 'Empanadas', 'Tortillas',
      'Pan', 'Facturas', 'Medialunas', 'Torta', 'Flan', 'Helado', 'Chocolates',
      'Galletitas', 'Bizcochos', 'Tarta', 'Budín', 'Gelatina', 'Mousse',
      'Café', 'Té', 'Mate', 'Coca Cola', 'Pepsi', 'Fanta', 'Sprite', 'Agua',
      'Jugo', 'Leche', 'Cerveza', 'Vino', 'Whisky', 'Ron', 'Vodka', 'Fernet'
    ]
  },

  // 💼 PROFESIONES
  {
    id: 'profesiones',
    name: 'PROFESIONES',
    icon: 'briefcase',
    words: [
      'Médico', 'Enfermero', 'Dentista', 'Veterinario', 'Farmacéutico',
      'Profesor', 'Maestro', 'Director', 'Policía', 'Bombero', 'Militar',
      'Piloto', 'Azafata', 'Chofer', 'Taxista', 'Mecánico', 'Electricista',
      'Plomero', 'Carpintero', 'Albañil', 'Pintor', 'Jardinero', 'Cocinero',
      'Chef', 'Camarero', 'Recepcionista', 'Secretaria', 'Contador',
      'Abogado', 'Juez', 'Periodista', 'Fotógrafo', 'Actor', 'Cantante',
      'Músico', 'Bailarín', 'Escritor', 'Pintor Artista', 'Escultor',
      'Arquitecto', 'Ingeniero', 'Programador', 'Diseñador', 'Modelo'
    ]
  },

  // ⚡ ACCIONES Y VERBOS
  {
    id: 'acciones',
    name: 'ACCIONES Y VERBOS',
    icon: 'zap',
    words: [
      'Correr', 'Caminar', 'Saltar', 'Bailar', 'Cantar', 'Reír', 'Llorar',
      'Gritar', 'Susurrar', 'Bostezar', 'Estornudar', 'Toser', 'Vomitar',
      'Comer', 'Beber', 'Masticar', 'Tragar', 'Nadar', 'Bucear', 'Volar',
      'Conducir', 'Manejar', 'Bicicleta', 'Patinar', 'Esquiar', 'Surfear',
      'Dormir', 'Despertar', 'Soñar', 'Pensar', 'Recordar', 'Olvidar',
      'Leer', 'Escribir', 'Dibujar', 'Pintar', 'Fotografiar', 'Filmar',
      'Cocinar', 'Limpiar', 'Lavar', 'Planchar', 'Barrer', 'Trapear',
      'Cortar', 'Pegar', 'Romper', 'Arreglar', 'Construir', 'Destruir'
    ]
  },

  // 🌍 LUGARES Y VIAJES
  {
    id: 'lugares',
    name: 'LUGARES Y VIAJES',
    icon: 'globe',
    words: [
      'Casa', 'Departamento', 'Hotel', 'Hospital', 'Escuela', 'Universidad',
      'Iglesia', 'Catedral', 'Templo', 'Sinagoga', 'Mezquita', 'Estadio',
      'Teatro', 'Cine', 'Museo', 'Biblioteca', 'Parque', 'Plaza', 'Mercado',
      'Supermercado', 'Centro Comercial', 'Aeropuerto', 'Estación de Tren',
      'Terminal de Ómnibus', 'Puerto', 'Playa', 'Montaña', 'Bosque', 'Desierto',
      'Río', 'Lago', 'Mar', 'Océano', 'Isla', 'Península', 'Continente',
      'País', 'Ciudad', 'Pueblo', 'Villa', 'Barrio', 'Calle', 'Avenida',
      'Plaza de Mayo', 'Obelisco', 'Coliseo', 'Torre Eiffel', 'Estatua de la Libertad'
    ]
  },

  // 🎭 EMOCIONES Y ESTADOS
  {
    id: 'emociones',
    name: 'EMOCIONES Y ESTADOS',
    icon: 'smile',
    words: [
      'Feliz', 'Triste', 'Enojado', 'Asustado', 'Sorprendido', 'Confundido',
      'Cansado', 'Aburrido', 'Emocionado', 'Nervioso', 'Calmado', 'Ansioso',
      'Orgulloso', 'Vergonzoso', 'Celoso', 'Enamorado', 'Odioso', 'Amigable',
      'Grosero', 'Educado', 'Paciente', 'Impaciente', 'Generoso', 'Tacaño',
      'Valiente', 'Cobarde', 'Inteligente', 'Tonto', 'Fuerte', 'Débil',
      'Alto', 'Bajo', 'Gordo', 'Flaco', 'Joven', 'Viejo', 'Hermoso', 'Feo',
      'Rico', 'Pobre', 'Famoso', 'Desconocido', 'Casado', 'Soltero', 'Divorciado'
    ]
  }
];

export const MIMIC_ALL_WORDS = MIMIC_CATEGORIES.flatMap(cat => cat.words);
