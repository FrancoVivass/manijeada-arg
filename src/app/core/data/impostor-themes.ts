export interface ImpostorTheme {
  id: string;
  name: string;
  category: string;
  words: string[];
}

export const IMPOSTOR_THEMES: ImpostorTheme[] = [
  // 🎬 CINE – CLÁSICOS
  {
    id: 'cine-clasicos',
    name: 'CINE - CLÁSICOS',
    category: '🎬 CINE',
    words: [
      'El Padrino', 'Scarface', 'Taxi Driver', 'Rocky', 'Rambo', 'Titanic',
      'Forrest Gump', 'Gladiador', 'Braveheart', 'Matrix', 'Terminator',
      'Alien', 'Depredador', 'Volver al Futuro', 'Jurassic Park', 'Indiana Jones',
      'E.T.', 'El Exorcista', 'Psicosis', 'El Resplandor', 'Casablanca',
      'Ciudadano Kane', 'La Lista de Schindler', 'El Bueno, el Malo y el Feo',
      'Apocalypse Now'
    ]
  },

  // 🎬 CINE – MODERNO / POP
  {
    id: 'cine-moderno',
    name: 'CINE - MODERNO / POP',
    category: '🎬 CINE',
    words: [
      'Avengers', 'Iron Man', 'Thor', 'Capitán América', 'Spiderman', 'Batman',
      'Joker', 'Deadpool', 'Logan', 'Inception', 'Interstellar', 'Tenet',
      'Avatar', 'Dune', 'Oppenheimer', 'Barbie', 'John Wick', 'Fast & Furious',
      'Misión Imposible', 'Transformers', 'Harry Potter', 'Animales Fantásticos',
      'El Señor de los Anillos', 'El Hobbit', 'Star Wars', 'Star Trek'
    ]
  },

  // 🎬 CINE – TERROR
  {
    id: 'cine-terror',
    name: 'CINE - TERROR',
    category: '🎬 CINE',
    words: [
      'El Conjuro', 'It', 'Halloween', 'Viernes 13', 'Pesadilla en lo Profundo',
      'Actividad Paranormal', 'Hereditary', 'Midsommar', 'Scream', 'Saw',
      'El Aro', 'La Monja', 'Annabelle', 'Blair Witch', 'Insidious'
    ]
  },

  // 🎬 CINE – COMEDIA
  {
    id: 'cine-comedia',
    name: 'CINE - COMEDIA',
    category: '🎬 CINE',
    words: [
      '¿Dónde está el piloto?', 'Proyecto X', 'Supercool', 'American Pie',
      'La Máscara', 'Tonto y Retonto', 'Ted', 'Scary Movie', 'Zoolander',
      'El Dictador', 'Qué pasó ayer', 'Una noche en el museo', 'Los Simpsons: La Película'
    ]
  },

  // 🎬 CINE – CIENCIA FICCIÓN
  {
    id: 'cine-ciencia-ficcion',
    name: 'CINE - CIENCIA FICCIÓN',
    category: '🎬 CINE',
    words: [
      'Matrix', 'Interstellar', 'Inception', 'Blade Runner', 'Dune', 'Avatar',
      'Terminator', 'Alien', 'Star Wars', 'Star Trek', 'Ready Player One',
      'Ex Machina', 'Minority Report'
    ]
  },

  // 🎬 CINE – DIRECTORES
  {
    id: 'cine-directores',
    name: 'CINE - DIRECTORES',
    category: '🎬 CINE',
    words: [
      'Steven Spielberg', 'Martin Scorsese', 'Christopher Nolan', 'Quentin Tarantino',
      'Ridley Scott', 'James Cameron', 'Tim Burton', 'Stanley Kubrick',
      'Alfred Hitchcock', 'Francis Ford Coppola', 'Guillermo del Toro',
      'Pedro Almodóvar', 'David Fincher', 'Wes Anderson', 'Denis Villeneuve'
    ]
  },

  // 🎬 CINE – ACTORES / ACTRICES
  {
    id: 'cine-actores',
    name: 'CINE - ACTORES / ACTRICES',
    category: '🎬 CINE',
    words: [
      'Leonardo DiCaprio', 'Brad Pitt', 'Tom Hanks', 'Johnny Depp',
      'Robert De Niro', 'Al Pacino', 'Denzel Washington', 'Morgan Freeman',
      'Keanu Reeves', 'Will Smith', 'Ryan Gosling', 'Margot Robbie',
      'Scarlett Johansson', 'Natalie Portman', 'Angelina Jolie', 'Emma Stone',
      'Jennifer Lawrence', 'Meryl Streep'
    ]
  },

  // ⚽ FÚTBOL – CONCEPTOS
  {
    id: 'futbol-conceptos',
    name: 'FÚTBOL - CONCEPTOS',
    category: '⚽ FÚTBOL',
    words: [
      'Gol', 'Penal', 'VAR', 'Offside', 'Córner', 'Clásico', 'Final', 'Mundial',
      'Champions', 'Libertadores', 'Estadio', 'Hincha', 'Tribuna', 'Camiseta',
      'DT', 'Capitán'
    ]
  },

  // ⚽ FÚTBOL – JUGADORES
  {
    id: 'futbol-jugadores',
    name: 'FÚTBOL - JUGADORES',
    category: '⚽ FÚTBOL',
    words: [
      'Messi', 'Maradona', 'Cristiano Ronaldo', 'Mbappé', 'Neymar', 'Suárez',
      'Lewandowski', 'Benzema', 'Modric', 'Kroos', 'Ronaldinho', 'Zidane',
      'Pelé', 'Ronaldo Nazário'
    ]
  },

  // ⚽ FÚTBOL – TORNEOS
  {
    id: 'futbol-torneos',
    name: 'FÚTBOL - TORNEOS',
    category: '⚽ FÚTBOL',
    words: [
      'Mundial', 'Copa América', 'Champions League', 'Europa League',
      'Libertadores', 'Sudamericana', 'Supercopa', 'Intercontinental'
    ]
  },

  // 🎶 MÚSICA
  {
    id: 'musica',
    name: 'MÚSICA',
    category: '🎶 MÚSICA',
    words: [
      'Rock', 'Pop', 'Trap', 'Cumbia', 'Reggaetón', 'Rap', 'DJ', 'Concierto',
      'Festival', 'Guitarra', 'Beat', 'Playlist'
    ]
  },

  // 🍔 COMIDAS
  {
    id: 'comidas',
    name: 'COMIDAS',
    category: '🍔 COMIDA',
    words: [
      'Pizza', 'Hamburguesa', 'Asado', 'Milanesa', 'Empanada', 'Sushi',
      'Tacos', 'Papas fritas', 'Helado', 'Choripán'
    ]
  },

  // 🍺 PREVIA / NOCHE
  {
    id: 'previa-noche',
    name: 'PREVIA / NOCHE',
    category: '🍺 PREVIA',
    words: [
      'Fernet', 'Birra', 'Shot', 'After', 'Boliche', 'DJ', 'Baile', 'Brindis',
      'Resaca'
    ]
  },

  // 🧠 RANDOM
  {
    id: 'random',
    name: 'RANDOM',
    category: '🧠 RANDOM',
    words: [
      'Mapache', 'Caos', 'Sistema', 'Error', 'Destino', 'Suerte', 'Logro'
    ]
  },

  // 🎲 TODAS LAS TEMÁTICAS (RANDOM)
  {
    id: 'todas-random',
    name: 'TODAS LAS TEMÁTICAS',
    category: '🎲 RANDOM',
    words: [
      // Todas las palabras combinadas de todas las temáticas anteriores
      // Se generarán dinámicamente en el componente
    ]
  }
];
