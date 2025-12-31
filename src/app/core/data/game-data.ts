export const CHALLENGES = [
  // REDES SOCIALES (MÁXIMA MANIJA)
  { text: "Subí una historia a Instagram que diga: 'El primero que responda me paga un Fernet'. Tenés que cumplir si alguien pica.", category: "SOCIAL", intensity: 6, penalty_shots: 3 },
  { text: "Mandale un audio de WhatsApp a tu ex o a tu 'casi algo' diciendo: 'Te extraño, pero más extraño escabiar sin culpa'.", category: "SOCIAL", intensity: 9, penalty_shots: 5 },
  { text: "Mostrá tu última búsqueda en Mercado Libre. Si es algo vergonzoso, tomás doble.", category: "SOCIAL", intensity: 5, penalty_shots: 2 },
  { text: "Mandale un mensaje al grupo de tu familia: 'Ma, hoy no llego, me quedé sin nafta en la Scaloneta'.", category: "SOCIAL", intensity: 7, penalty_shots: 3 },
  { text: "Dejá que el grupo elija a quién de tus seguidos de IG le tenés que comentar: '¿Sale esa previa?'", category: "SOCIAL", intensity: 8, penalty_shots: 4 },
  { text: "Mostrá tus mensajes archivados de WhatsApp. El grupo elige uno para leer.", category: "SOCIAL", intensity: 9, penalty_shots: 5 },
  { text: "Publicá una foto de tu vaso actual y etiquetá a @ManijeadaApp (o simulá hacerlo).", category: "SOCIAL", intensity: 4, penalty_shots: 2 },

  // PRESENCIAL / GRUPO (LA MEJOR PREVIA)
  { text: "Votación rápida: ¿Quién es el más 'pollera' del grupo? El ganador toma 2 shots.", category: "GRUPO", intensity: 4, penalty_shots: 2 },
  { text: "Hacé un fondo blanco de lo que estés tomando. Si es puro, sos un prócer.", category: "ALCOHOL", intensity: 8, penalty_shots: 4 },
  { text: "El que tenga el celular con el vidrio más astillado toma un shot por descuidado.", category: "ALCOHOL", intensity: 3, penalty_shots: 1 },
  { text: "Cascada Argentina: Empezás vos, y nadie para hasta que el de su derecha pare. ¡Dale que es viernes!", category: "ALCOHOL", intensity: 7, penalty_shots: 3 },
  { text: "Contá la vez que más cerca estuviste de terminar en cana o en un geriátrico.", category: "SOCIAL", intensity: 6, penalty_shots: 3 },
  { text: "Intercambiá calzado con el de tu izquierda hasta que termine la ronda. Si tenés olor a pata, tomás 2.", category: "CAOS", intensity: 7, penalty_shots: 3 },
  { text: "Armá un 'viajero' (botella cortada) con lo que haya y compartilo con los 2 que menos tomaron.", category: "GRUPO", intensity: 6, penalty_shots: 2 },
  { text: "Si alguna vez te 'gorrearon', tomás un shot para olvidar. Si gorreaste vos, tomás 3 por vigilante.", category: "ALCOHOL", intensity: 5, penalty_shots: 2 },
  { text: "El grupo te tiene que poner un apodo de 'viejo' por el resto de la noche. Si no respondés al apodo, tomás.", category: "CAOS", intensity: 5, penalty_shots: 2 },
  
  // CAOS & EXTREMO (PREVIA MANIJERA)
  { text: "Llamá a un contacto que empiece con 'J' y decile: 'Mañana paso por los mates, llevá facturas'. Cortá sin dejar que hable.", category: "CAOS", intensity: 8, penalty_shots: 4 },
  { text: "Ponete una prenda de ropa al revés hasta que alguien saque un 'LEGENDARIO' en la ruleta.", category: "CAOS", intensity: 6, penalty_shots: 3 },
  { text: "Hacé el paso prohibido de cumbia que más te guste por 20 segundos sin música.", category: "FISICO", intensity: 7, penalty_shots: 3 },
  { text: "Mezclá tu trago con un poco de cerveza, vino y lo que haya. El famoso 'Tutti-frutti' del mal.", category: "EXTREMO", intensity: 10, penalty_shots: 10 },
  { text: "Dejá que te dibujen un sol en la cara con labial o fibra. Si te negás, 5 shots.", category: "EXTREMO", intensity: 9, penalty_shots: 5 }
];

export const DRINKS = [
  { text: "Toman todos los que alguna vez tomaron Fernet con Manaos o Vitone.", type: "SOCIAL", shots: 2 },
  { text: "Si tenés una remera de alguna banda de rock nacional, tomás 1 shot.", type: "CONDITIONAL", shots: 1 },
  { text: "El que tenga el sticker de WhatsApp más turbio, toma un shot doble.", type: "CONDITIONAL", shots: 2 },
  { text: "Si tenés la App de Mi Argentina instalada, tomás 1 por ciudadano ejemplar.", type: "CONDITIONAL", shots: 1 },
  { text: "Toman los que están solteros 'pero con compromiso'.", type: "SOCIAL", shots: 2 },
  { text: "Si debés plata de un asado, tomás 3 shots por garca.", type: "CONDITIONAL", shots: 3 },
  { text: "Toma 1 shot el que menos batería tenga. ¡Cargalo que se apaga la manija!", type: "CONDITIONAL", shots: 1 },
  { text: "Si tenés una multa de tránsito sin pagar, tomás 2 shots.", type: "CONDITIONAL", shots: 2 }
];

export const ACHIEVEMENTS = [
  { id: 'first_game', name: 'Bautismo de Previa', description: 'Tu primera partida oficial', rarity: 'COMMON', icon: '🔥' },
  { id: 'first_shot', name: 'Primer Trago', description: 'Primer shot registrado', rarity: 'COMMON', icon: '🥃' },
  { id: 'social_king', name: 'Influencer del Escabio', description: 'Completaste 5 retos sociales', rarity: 'RARE', icon: '📱' },
  { id: 'chaos_survivor', name: 'Soldado de la Scaloneta', description: 'Sobreviviste a un reto extremo', rarity: 'LEGENDARY', icon: '🌀' }
];
