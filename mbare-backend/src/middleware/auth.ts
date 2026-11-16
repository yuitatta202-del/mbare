import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// L'URL del JWKS del tuo progetto Supabase
// Sostituisci cdpimoucbplpenpfvama con il tuo Project Ref
const JWKS_URI = 'https://cdpimoucbplpenpfvama.supabase.co/auth/v1/.well-known/jwks.json';

const client = jwksClient({
  jwksUri: JWKS_URI,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

export interface AuthRequest extends Request {
  user?: any;
}

// Funzione per ottenere la chiave pubblica in base al kid (Key ID) del token
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('❌ Errore recupero chiave JWKS:', err);
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante o non valido' });
  }

  const token = authHeader.split(' ')[1];

  // Verifica il token usando il JWKS (supporta ES256 e RS256)
  jwt.verify(token, getKey, { algorithms: ['ES256', 'RS256'] }, (err, decoded) => {
    if (err) {
      console.error('❌ ERRORE VERIFICA TOKEN:', err.message);
      return res.status(401).json({ error: 'Token scaduto o invalido' });
    }
    
    req.user = decoded;
    console.log('✅ TOKEN DECODIFICATO:', decoded);
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.user_role) {
      console.log('⚠️ RUOLO NON DEFINITO:', req.user);
      return res.status(403).json({ error: 'Accesso negato: ruolo non definito' });
    }

    if (!roles.includes(req.user.user_role)) {
      console.log(`⚠️ RUOLO NON AUTORIZZATO: ${req.user.user_role} (richiesto: ${roles.join(', ')})`);
      return res.status(403).json({ 
        error: `Accesso negato: richiesto uno dei ruoli [${roles.join(', ')}]` 
      });
    }

    next();
  };
};