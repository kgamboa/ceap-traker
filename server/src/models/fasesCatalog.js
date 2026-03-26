const fasesCatalog = {
  1: [ // Convocatoria
    { clave: 'convocatoria_padres', nombre: 'Convocatoria Padres de Familia' },
    { clave: 'convocatoria_trabajadores', nombre: 'Convocatoria Trabajadores' },
    { clave: 'convocatoria_alumnos', nombre: 'Convocatoria Alumnos' },
  ],
  2: [ // Asambleas
    { clave: 'acta_padres', nombre: 'Acta de Asamblea Padres de Familia' },
    { clave: 'lista_padres', nombre: 'Lista de Asistencia Padres de Familia' },
    { clave: 'evidencia_padres', nombre: 'Evidencia Fotográfica Asamblea Padres de Familia' },
    { clave: 'acta_trabajadores', nombre: 'Acta de Asamblea Trabajadores' },
    { clave: 'lista_trabajadores', nombre: 'Lista de Asistencia Trabajadores' },
    { clave: 'evidencia_trabajadores', nombre: 'Evidencia Fotográfica Asamblea Trabajadores' },
    { clave: 'acta_alumnos', nombre: 'Acta de Asamblea Alumnos' },
    { clave: 'lista_alumnos', nombre: 'Lista de Asistencia Alumnos' },
    { clave: 'evidencia_alumnos', nombre: 'Evidencia Fotográfica Asamblea Alumnos' },
  ],
  3: [ // Notario Público
    { clave: 'acta_constitutiva', nombre: 'Acta Constitutiva Notariada' },
    { clave: 'registro_publico', nombre: 'Registro Público' },
  ],
  4: [ // SAT
    { clave: 'acuse_socios', nombre: 'Acuse cambio de Socios/Accionistas' },
    { clave: 'e_firma', nombre: 'Acuse de Generación de e.firma' },
    { clave: 'opinion_cumplimiento', nombre: 'Autorizar Resultado Público de la Opinión de Cumplimiento Fiscal' },
  ],
  5: [ // Cuenta Bancaria
    { clave: 'contrato_cuenta', nombre: 'Contrato de Apertura de Cuenta' },
    { clave: 'registro_firmas', nombre: 'Registro de Firmas Autorizadas' },
  ]
};

module.exports = fasesCatalog;
