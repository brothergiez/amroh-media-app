export function requireScope(scope) {
  return (req, res, next) => {
    if (!req.apiKey || req.apiKey.scope !== scope) {
      return res.status(403).json({
        error: "forbidden",
        message: "API key scope is not allowed for this endpoint",
      });
    }
    next();
  };
}

export function requireAnyScope(...scopes) {
  return (req, res, next) => {
    if (!req.apiKey || !scopes.includes(req.apiKey.scope)) {
      return res.status(403).json({
        error: "forbidden",
        message: "API key scope is not allowed for this endpoint",
      });
    }
    next();
  };
}
