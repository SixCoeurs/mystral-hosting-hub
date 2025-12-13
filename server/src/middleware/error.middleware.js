// Middleware de gestion des erreurs
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Erreurs de validation Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Données invalides',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Erreurs MySQL/MariaDB
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json({
          success: false,
          error: 'Cette entrée existe déjà'
        });
      case 'ER_NO_REFERENCED_ROW':
      case 'ER_NO_REFERENCED_ROW_2':
        return res.status(400).json({
          success: false,
          error: 'Référence invalide'
        });
      case 'ECONNREFUSED':
        return res.status(503).json({
          success: false,
          error: 'Service de base de données indisponible'
        });
      default:
        console.error('Database error code:', err.code);
    }
  }

  // Erreur personnalisée avec statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Erreur générique
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Une erreur interne est survenue'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

// Middleware pour les routes non trouvées
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} non trouvée`
  });
}

// Wrapper async pour gérer les erreurs automatiquement
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Classe d'erreur personnalisée
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
