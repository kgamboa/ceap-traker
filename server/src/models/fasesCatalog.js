const fasesCatalog = {
  // Asignamos los documentos esperados por cada fase (usando numero_orden como key provisional)
  1: [ // Convocatoria
    { clave: 'convocatoria_1', nombre: 'Primera Convocatoria' },
    { clave: 'convocatoria_2', nombre: 'Segunda Convocatoria' },
    { clave: 'convocatoria_3', nombre: 'Tercera Convocatoria' },
  ],
  2: [ // Asambleas
    { clave: 'acta_padres', nombre: 'Acta Padres de Familia' },
    { clave: 'acta_trabajadores', nombre: 'Acta Trabajadores' },
    { clave: 'acta_estudiantes', nombre: 'Acta Estudiantes' },
  ],
  3: [ // Notario Público
    { clave: 'acta_constitutiva_notariada', nombre: 'Acta Constitutiva Notariada' },
  ],
  4: [ // SAT
    { clave: 'rfc_ceap', nombre: 'RFC de la CEAP' },
    { clave: 'e_firma', nombre: 'Acuse de e.firma' },
  ],
  5: [ // Cuenta Bancaria
    { clave: 'contrato_cuenta', nombre: 'Contrato de Cuenta Bancaria' },
    { clave: 'estado_cuenta_inicial', nombre: 'Estado de Cuenta Inicial' },
  ]
};

module.exports = fasesCatalog;
