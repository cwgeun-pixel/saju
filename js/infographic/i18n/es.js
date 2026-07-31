// 인포그래픽 카드의 스페인어 문구 팩
export default {
  // ── 카드 UI 라벨 ──
  ui: {
    // 한자를 이름 옆에 병기할지 (한자권 언어는 이름이 곧 한자라 불필요)
    showHanja: true,
    cardSaju: 'Cuatro Pilares', cardSipsin: 'Diez Dioses · Estrellas', cardLuck: 'Ciclos de Suerte',
    cardZiwei: 'Zi Wei Dou Shu', cardNatal: 'Astrología', cardYear: 'Flujo del Año', cardGoonghap: 'Compatibilidad',

    kickerSaju: 'CUATRO PILARES · Carta', kickerSipsin: 'CUATRO PILARES · Diez Dioses',
    kickerLuck: 'CUATRO PILARES · Flujo de la Suerte', kickerZiwei: 'ZI WEI DOU SHU · Carta',
    kickerNatal: 'CARTA NATAL', kickerGoonghap: 'COMPATIBILIDAD · El vínculo entre dos',
    kickerYear: (y) => `ZI WEI DOU SHU · Año ${y}`,

    secWongook: 'Los Cuatro Pilares', secElements: 'Distribución de los Elementos', secStrength: 'Fuerte · Débil',
    secSipsin: 'Fuerza de los Diez Dioses', secSinsal: 'Estrellas Especiales', secUnseong: 'Doce Etapas Vitales',
    secSeyun: (y) => `Año ${y}`, secDaewoon: 'Ciclos de 10 Años',
    secPalaces: 'Los Doce Palacios', secDaxian: 'Flujo de los Grandes Ciclos',
    secPlanets: 'Posiciones Planetarias', secAspects: 'Aspectos Principales',
    secSihua: 'Transformaciones del Año', secMonths: 'Flujo Mensual',
    secAreas: 'Compatibilidad por Área', secBranchRel: 'Relación de Ramas del Día',

    pillars: ['Hora', 'Día', 'Mes', 'Año'],
    male: 'Hombre', female: 'Mujer', age: (n) => `${n} años`,
    ageRange: (a, b) => `${a}~${b} años`, ageFrom: (n) => `${n} años`,
    unknownTime: 'Hora desconocida', noName: 'Mi carta',
    over: 'Exceso', under: 'Escaso', strongest: 'Máximo', now: 'Actual',
    yong: 'Favorable', hee: 'De Apoyo', gi: 'Desfavorable',
    good: 'Oportunidad', flat: 'Estable', watch: 'Cautela',
    gongmang: (b) => `Vacío Celestial · ${b}`,
    yearFlow: (y) => `El flujo del año ${y}`,
    yearLabel: (y) => `Año ${y}`,
    liuyear: (s) => `Anualidad · ${s}`,
    month: (n) => `Mes ${n}`,
    house: (n) => `Casa ${n}`,
    orb: (v) => `${v}°`,
    noSinsal: 'Una carta sobria, sin estrellas especiales destacadas.',
    unknownTimeNote: 'Hora de nacimiento desconocida — se omiten el ascendente y las casas.',
    save: 'Guardar imagen', share: 'Compartir', making: 'Creando…', done: 'Listo', failed: 'Error',
    embedTitle: (s) => `Tarjeta resumen de ${s} · guárdala para conservarla`,
    embedSaju: 'Cuatro Pilares', embedZiwei: 'Zi Wei Dou Shu', embedNatal: 'Astrología',
  },

  // ── 오행 ──
  element: { 목: 'Madera', 화: 'Fuego', 토: 'Tierra', 금: 'Metal', 수: 'Agua' },

  // ── 일간 10종 ──
  daymaster: {
    甲: { title: 'Gran árbol que crece recto', desc: 'Una energía que se alza derecha hacia arriba. Fuerte liderazgo e impulso; una vez fijado el rumbo, rara vez lo cambia.' },
    乙: { title: 'Enredadera que trepa con flexibilidad', desc: 'Una energía suave pero tenaz. Se adapta bien al entorno y conecta a las personas con naturalidad.' },
    丙: { title: 'Sol que ilumina todas las cosas', desc: 'Una energía luminosa que se expande sin freno. Gran capacidad expresiva y una presencia que ilumina el entorno.' },
    丁: { title: 'Vela que alumbra la oscuridad', desc: 'Una energía tenue pero que cala hondo. Con una intuición delicada, lee lo que otros callan.' },
    戊: { title: 'Gran montaña que se mantiene firme', desc: 'Una energía sólida e inamovible. Inspira una confianza honda y se vuelve el eje en que otros se apoyan.' },
    己: { title: 'Tierra fértil que hace crecer la vida', desc: 'Una energía que acoge y cultiva. Amplia capacidad de acogida y un sentido práctico muy afinado.' },
    庚: { title: 'Acero y espada forjados con dureza', desc: 'La energía del acero y la espada. Firme en principios y decisión, persigue sus metas hasta el final.' },
    辛: { title: 'Joya pulida con precisión', desc: 'Una energía que brilla clara y afilada. Su sentido estético y su exigencia de acabado son excepcionales.' },
    壬: { title: 'Mar que fluye ancho y profundo', desc: 'Una energía que fluye sin obstáculos. Amplitud de pensamiento y ningún temor al cambio.' },
    癸: { title: 'Llovizna que empapa todas las cosas', desc: 'Una energía que se filtra en silencio. Intuición fina que percibe antes que nadie el giro de las cosas.' },
  },

  // ── 십신 5분류 ──
  sipsinGroup: {
    비겁: { label: 'Ego', desc: 'La fuerza de la autonomía y la competencia. Fuerte da independencia; en exceso, terquedad y roces.' },
    식상: { label: 'Creación', desc: 'La fuerza de la expresión y la producción. Fuerte da talento y creatividad; en exceso, impaciencia con las normas.' },
    재성: { label: 'Riqueza', desc: 'La fuerza del dinero y el sentido práctico. Fuerte da olfato para lo útil; en exceso, desgaste por abarcar demasiado.' },
    관성: { label: 'Autoridad', desc: 'La fuerza de la responsabilidad y el control. Fuerte trae reconocimiento en la organización; en exceso, presión y estrés.' },
    인성: { label: 'Apoyo', desc: 'La fuerza del aprendizaje y la protección. Fuerte favorece estudios y títulos; en exceso, retrasa la acción.' },
  },

  // ── 십신 한자 → 표기 ──
  sipsin: {
    本元: 'Maestro del Día', 比肩: 'Par', 劫財: 'Rival', 食神: 'Creatividad', 傷官: 'Expresión',
    偏財: 'Riqueza Indirecta', 正財: 'Riqueza Directa', 偏官: 'Presión', 正官: 'Autoridad', 偏印: 'Apoyo Indirecto', 正印: 'Apoyo Directo',
  },

  // ── 12운성 ──
  unseong: {
    長生: 'Nacimiento', 沐浴: 'Baño', 冠帶: 'Madurez', 乾祿: 'Plenitud', 帝旺: 'Apogeo', 衰: 'Declive',
    病: 'Enfermedad', 死: 'Muerte', 墓: 'Tumba', 絕: 'Vacío', 絶: 'Vacío', 胎: 'Concepción', 養: 'Crianza',
  },

  // ── 신살 ──
  sinsalType: { 길신: 'Auspicioso', 중성: 'Neutral', 흉신: 'Adverso' },
  sinsal: {
    cheonul: { name: 'Noble Celestial', type: 'Auspicioso', desc: 'En cada crisis aparece alguien que ayuda. Vínculos providenciales en los momentos decisivos.' },
    munchang: { name: 'Estrella del Saber', type: 'Auspicioso', desc: 'Estrella del estudio, los exámenes y la escritura. El aprendizaje se convierte en logro.' },
    cheonduk: { name: 'Virtud Celestial', type: 'Auspicioso', desc: 'Estrella de la virtud que atenúa la desgracia. Esquiva los grandes males.' },
    wolduk: { name: 'Virtud Lunar', type: 'Auspicioso', desc: 'La protección discreta del entorno es densa. Un lugar sostenido por la buena gente.' },
    geumyeo: { name: 'Carroza Dorada', type: 'Auspicioso', desc: 'Estrella del bienestar y la fortuna conyugal. Una base de vida cómoda.' },
    yangin: { name: 'Filo de la Espada', type: 'Neutral', desc: 'Un empuje afilado como una hoja. Bien canalizado en un oficio, es un arma poderosa.' },
    goegang: { name: 'Estrella Indómita', type: 'Neutral', desc: 'Temperamento extremadamente fuerte. O líder o aislado; no hay término medio.' },
    dohwa: { name: 'Flor de Melocotón', type: 'Neutral', desc: 'Un atractivo que arrastra a la gente. Favorece el arte, el espectáculo y el trato social.' },
    hongyeom: { name: 'Llama Roja', type: 'Neutral', desc: 'Encanto sutil y popularidad. Los vínculos amorosos nunca faltan.' },
    baekho: { name: 'Tigre Blanco', type: 'Adverso', desc: 'Cuidado con accidentes y heridas repentinas. La clave está en la seguridad y la salud.' },
  },

  // ── 자미두수 ──
  palace: {
    命宮: 'Palacio de la Vida', 兄弟: 'Hermanos', 夫妻: 'Pareja', 子女: 'Hijos', 財帛: 'Riqueza', 疾厄: 'Salud',
    遷移: 'Viajes', 交友: 'Amistades', 官祿: 'Carrera', 田宅: 'Hogar', 福德: 'Fortuna', 父母: 'Padres',
  },
  star: {
    紫微: 'Estrella del emperador. Ocupa el centro y dirige.',
    天機: 'Estrella de la sabiduría y la estrategia. Fuerte en el trabajo intelectual.',
    太陽: 'Estrella de la luz que da. Brilla en la actividad pública.',
    武曲: 'Estrella de la riqueza y la acción. Empuja con tenacidad.',
    天同: 'Estrella de la dicha y el sosiego. Se deja llevar con suavidad.',
    廉貞: 'Estrella del cambio y la contienda. Logra entre altibajos.',
    天府: 'Estrella del granero. Fuerte en la estabilidad y la acumulación.',
    太陰: 'Estrella delicada de la luna. Lúcida en lo interior y en el manejo del dinero.',
    貪狼: 'Estrella del deseo y el talento. Polifacética y sociable.',
    巨門: 'Estrella de la elocuencia. Se impone con la palabra y la lógica.',
    天相: 'Estrella del consejero. Ajusta y media entre las partes.',
    天梁: 'Estrella del mayor. Energía de principios y protección.',
    七殺: 'Estrella pionera. Abre camino de frente.',
    破軍: 'Estrella de la destrucción y la reconstrucción. Rompe lo viejo y levanta lo nuevo.',
  },

  // ── 점성술 ──
  sign: {
    Aries: { name: 'Aries', trait: 'pionero que se lanza el primero' },
    Taurus: { name: 'Tauro', trait: 'guardián inquebrantable de la estabilidad' },
    Gemini: { name: 'Géminis', trait: 'mensajero que conecta por curiosidad' },
    Cancer: { name: 'Cáncer', trait: 'protector que acoge y resguarda' },
    Leo: { name: 'Leo', trait: 'protagonista que brilla en el centro del escenario' },
    Virgo: { name: 'Virgo', trait: 'artesano que remata cada detalle' },
    Libra: { name: 'Libra', trait: 'mediador que busca el equilibrio' },
    Scorpio: { name: 'Escorpio', trait: 'investigador que ahonda hasta el fondo' },
    Sagittarius: { name: 'Sagitario', trait: 'explorador que cruza las fronteras' },
    Capricorn: { name: 'Capricornio', trait: 'escalador que llega hasta la cima' },
    Aquarius: { name: 'Acuario', trait: 'innovador que rompe los moldes' },
    Pisces: { name: 'Piscis', trait: 'soñador que disuelve los límites' },
  },
  planet: {
    Sun: { name: 'Sol', key: 'Identidad · yo esencial' },
    Moon: { name: 'Luna', key: 'Emoción · inconsciente' },
    Mercury: { name: 'Mercurio', key: 'Pensamiento · comunicación' },
    Venus: { name: 'Venus', key: 'Afecto · sentido estético' },
    Mars: { name: 'Marte', key: 'Impulso · deseo' },
    Jupiter: { name: 'Júpiter', key: 'Expansión · fortuna' },
    Saturn: { name: 'Saturno', key: 'Responsabilidad · pruebas' },
    Uranus: { name: 'Urano', key: 'Ruptura · originalidad' },
    Neptune: { name: 'Neptuno', key: 'Ideal · inspiración' },
    Pluto: { name: 'Plutón', key: 'Transformación · renacimiento' },
    Chiron: { name: 'Quirón', key: 'Herida · sanación' },
    NorthNode: { name: 'Nodo Norte', key: 'Tarea de vida' },
    SouthNode: { name: 'Nodo Sur', key: 'Hábitos innatos' },
    Fortuna: { name: 'Parte de la Fortuna', key: 'Lugar de la dicha' },
  },
  big3: {
    sun: { label: 'Sol', sub: 'Yo esencial' },
    moon: { label: 'Luna', sub: 'Emoción interior' },
    asc: { label: 'Ascendente', sub: 'Imagen que proyectas' },
  },
  aspect: {
    conjunction: { name: 'Conjunción', tone: 'Unión' },
    trine: { name: 'Trígono', tone: 'Armonía' },
    sextile: { name: 'Sextil', tone: 'Oportunidad' },
    square: { name: 'Cuadratura', tone: 'Tensión' },
    opposition: { name: 'Oposición', tone: 'Contraste' },
  },

  // ── 궁합 ──
  goonghap: {
    self: 'Tú', partner: 'Pareja',
    stemRel: {
      SAME: { label: 'Afinidad (比和)', title: 'Un vínculo cómodo y parecido',
        desc: 'Al compartir la misma energía os entendéis bien y hay comodidad desde el principio. Pero también compartís los defectos, así que hace falta flexibilidad para compensaros.' },
      A_GEN_B: { label: 'Generación (相生)', title: 'Un vínculo que guía y hace crecer',
        desc: 'La energía del primero alimenta a la del segundo. Durará si se cuida el equilibrio para que quien da no acabe agotado.' },
      B_GEN_A: { label: 'Generación (相生)', title: 'Un vínculo que sostiene y completa',
        desc: 'La energía del segundo alimenta a la del primero. Ese apoyo firme se traduce en estabilidad emocional.' },
      A_CTRL_B: { label: 'Control (相剋)', title: 'Un vínculo intenso y dinámico',
        desc: 'Cuanto más fuerte es la atracción, más roces por el mando. Si se orienta hacia el acompañamiento y no el control, se vuelve impulso.' },
      B_CTRL_A: { label: 'Control (相剋)', title: 'Un vínculo intenso y dinámico',
        desc: 'Cuanto más fuerte es la atracción, más roces por el mando. Respetar el ritmo del otro crea el lazo más sólido.' },
    },
    branchRel: {
      HEX: { tag: 'Unión (六合)', desc: 'Las ramas del día se combinan y el día a día encaja bien.' },
      TRIO: { tag: 'Trígono (三合)', desc: 'Pertenecen al mismo trío y sus rumbos convergen con naturalidad.' },
      CLASH: { tag: 'Choque (沖)', desc: 'Las ramas del día chocan y pueden surgir fricciones inesperadas.' },
      NEUTRAL: { tag: 'Neutral', desc: 'No hay unión ni choque especial entre las ramas del día; es una relación sobria.' },
    },
    score: {
      5: 'Inmejorable — hasta las ramas del día armonizan.',
      4: 'Un buen vínculo.',
      3: 'Un vínculo estable y sin sobresaltos.',
      2: 'Un vínculo que requiere esfuerzo.',
      1: 'Hace falta mucha paciencia y comprensión.',
    },
    areas: { emotion: 'Emoción · afinidad', comm: 'Comunicación · diálogo', stability: 'Realidad · estabilidad' },
    dayGan: (el) => `Maestro del Día ${el}`,
    yinyangDiff: 'Al tener polaridades distintas, vuestras miradas enriquecen la conversación.',
    yinyangSame: 'Con la misma polaridad la empatía es rápida, pero conviene practicar la aceptación de opiniones distintas.',
  },

  // ── 문장 템플릿 ──
  tpl: {
    strengthStrong: (el) => `La energía del Maestro del Día es fuerte. Conviene drenarla con ${el} para equilibrarla.`,
    strengthWeak: (el) => `La energía del Maestro del Día es débil. Necesita el sostén de ${el} para ganar fuerza.`,
    strengthEven: (el) => `Una carta equilibrada, con la energía bien repartida. ${el} marca el rumbo del flujo.`,
    strengthType: { 신강: 'Fuerte', 신약: 'Débil', 중화: 'Equilibrado' },
    elementLine: (over, oc, lack, lc) => `${over} es el más denso con ${oc}, y ${lack} el más escaso con ${lc}.`,
    sipsinTop: (label, n, desc) => `${label} es el más denso con ${n}. ${desc}`,
    seyunDesc: (el, tone) => `Un año en el que circula la energía de ${el}. ${tone}`,
    toneYong: 'Al ser el elemento favorable, el flujo es fluido y lo emprendido llega a dar fruto.',
    toneHee: 'Al ser el elemento de apoyo, todo se resuelve sin mayores contratiempos.',
    toneGi: 'Al ser el elemento desfavorable, conviene conservar antes que expandir.',
    toneFlat: 'Un flujo sereno, sin desequilibrios marcados.',
    daewoonNow: (age, gz, sipsin, unseong) =>
      `Desde los ${age} años entras en el gran ciclo ${gz}. La energía de ${sipsin} guía la corriente de estos diez años, y la etapa vital es ${unseong}.`,
    daxianNow: (a, b, palace, gz) => `Ahora, entre los ${a} y los ${b} años, transitas el gran ciclo ${gz} con ${palace} activado.`,
    natalOverview: (sunSign, sunTrait, moonSign, moonTrait) =>
      `Tu Sol en ${sunSign} es ${sunTrait}; tu Luna en ${moonSign}, ${moonTrait}.`,
    yearLu: (star, palace) => `La transformación en Prosperidad de ${star} entra en ${palace} y abre ese ámbito.`,
    yearGi: (star, palace) => `La transformación en Obstáculo de ${star} está en ${palace}, así que conviene bajar el ritmo en esa área.`,
  },
};
