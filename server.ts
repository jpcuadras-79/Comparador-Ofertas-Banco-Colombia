import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const SESSION_SECRET = process.env.SESSION_SECRET || 'bn-corredora-seguros-session-secret-2026';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser(SESSION_SECRET));

// Storage paths in data/
const dataDir = path.resolve(__dirname, 'data');
const usuariosPath = path.join(dataDir, 'usuarios.json');
const comparacionesPath = path.join(dataDir, 'comparaciones.json');
const auditoriaPath = path.join(dataDir, 'auditoria.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// User interface
interface UsuarioRecord {
  id: string;
  usuario: string; // nombre corto, sin espacios, en minúsculas
  nombreCompleto: string;
  rol: 'administrador' | 'asesor';
  estado: 'activo' | 'suspendido';
  debeCambiarClave: boolean;
  fechaCreacion: string;
  ultimoAcceso: string | null;
  passwordHash: string;
}

// Ensure initial usuarios.json
function initUsuariosFile() {
  if (!fs.existsSync(usuariosPath)) {
    console.log('Inicializando data/usuarios.json con administrador inicial...');
    const adminPasswordHash = bcrypt.hashSync('Fundepos2026*', 10);
    const initialUsers: UsuarioRecord[] = [
      {
        id: 'usr-admin-01',
        usuario: 'admin',
        nombreCompleto: 'Administrador',
        rol: 'administrador',
        estado: 'activo',
        debeCambiarClave: true,
        fechaCreacion: new Date().toISOString(),
        ultimoAcceso: null,
        passwordHash: adminPasswordHash,
      },
    ];
    fs.writeFileSync(usuariosPath, JSON.stringify(initialUsers, null, 2), 'utf-8');
  }

  if (!fs.existsSync(comparacionesPath)) {
    fs.writeFileSync(comparacionesPath, JSON.stringify([], null, 2), 'utf-8');
  }

  if (!fs.existsSync(auditoriaPath)) {
    fs.writeFileSync(auditoriaPath, JSON.stringify([], null, 2), 'utf-8');
  }
}

initUsuariosFile();

function getUsuarios(): UsuarioRecord[] {
  try {
    if (!fs.existsSync(usuariosPath)) {
      initUsuariosFile();
    }
    const content = fs.readFileSync(usuariosPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error leyendo data/usuarios.json:', err);
    return [];
  }
}

function saveUsuarios(users: UsuarioRecord[]) {
  fs.writeFileSync(usuariosPath, JSON.stringify(users, null, 2), 'utf-8');
}

function safeUser(user: UsuarioRecord) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function registrarAuditoria(
  accion: string,
  usuarioId: string | null,
  usuarioLogin: string | null,
  detalles?: any
) {
  try {
    const logs = fs.existsSync(auditoriaPath)
      ? JSON.parse(fs.readFileSync(auditoriaPath, 'utf-8'))
      : [];
    logs.push({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fecha: new Date().toISOString(),
      accion,
      usuarioId,
      usuario: usuarioLogin,
      detalles: detalles || null,
    });
    fs.writeFileSync(auditoriaPath, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error registrando auditoría:', err);
  }
}

// Authentication Middleware
function requireAuth(req: any, res: any, next: any) {
  const userId = req.signedCookies['bn_session'];

  if (!userId) {
    return res.status(401).json({ error: 'No autorizado: sesión no válida o expirada.' });
  }

  const users = getUsuarios();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.clearCookie('bn_session', { httpOnly: true, signed: true, sameSite: 'lax' });
    return res.status(401).json({ error: 'No autorizado: usuario inexistente.' });
  }

  if (user.estado !== 'activo') {
    res.clearCookie('bn_session', { httpOnly: true, signed: true, sameSite: 'lax' });
    return res.status(401).json({ error: 'usuario suspendido, contacte al administrador' });
  }

  req.user = user;
  next();
}

// ==================== AUTH ROUTES ====================

// POST /api/login (usuario y contraseña)
app.post('/api/login', (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({
        success: false,
        error: 'usuario o contraseña incorrectos',
      });
    }

    const cleanUser = String(usuario).trim().toLowerCase();
    const users = getUsuarios();
    const user = users.find((u) => u.usuario.toLowerCase() === cleanUser);

    if (!user) {
      registrarAuditoria('login_fallido', null, cleanUser, { motivo: 'usuario_no_encontrado' });
      return res.status(401).json({
        success: false,
        error: 'usuario o contraseña incorrectos',
      });
    }

    const passwordMatch = bcrypt.compareSync(String(contrasena), user.passwordHash);
    if (!passwordMatch) {
      registrarAuditoria('login_fallido', user.id, user.usuario, { motivo: 'clave_invalida' });
      return res.status(401).json({
        success: false,
        error: 'usuario o contraseña incorrectos',
      });
    }

    if (user.estado === 'suspendido') {
      registrarAuditoria('login_suspendido', user.id, user.usuario);
      return res.status(403).json({
        success: false,
        error: 'usuario suspendido, contacte al administrador',
      });
    }

    // Update last access
    user.ultimoAcceso = new Date().toISOString();
    saveUsuarios(users);

    // Set signed cookie for 8 hours (Rule 4)
    res.cookie('bn_session', user.id, {
      httpOnly: true,
      signed: true,
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    registrarAuditoria('login_exitoso', user.id, user.usuario);

    return res.json({
      success: true,
      user: safeUser(user),
    });
  } catch (error: any) {
    console.error('Error en /api/login:', error);
    return res.status(500).json({ success: false, error: 'Error interno en autenticación.' });
  }
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
  const userId = req.signedCookies['bn_session'];
  if (userId) {
    const users = getUsuarios();
    const user = users.find((u) => u.id === userId);
    registrarAuditoria('logout', userId, user?.usuario || null);
  }
  res.clearCookie('bn_session', { httpOnly: true, signed: true, sameSite: 'lax' });
  return res.json({ success: true });
});

// GET /api/yo (usuario conectado)
app.get('/api/yo', (req, res) => {
  const userId = req.signedCookies['bn_session'];
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const users = getUsuarios();
  const user = users.find((u) => u.id === userId);

  if (!user || user.estado !== 'activo') {
    res.clearCookie('bn_session', { httpOnly: true, signed: true, sameSite: 'lax' });
    return res.status(401).json({ error: 'Sesión no válida o expirada' });
  }

  return res.json({
    success: true,
    user: safeUser(user),
  });
});

// POST /api/cambiar-clave (mínimo 8 caracteres, al menos un número)
app.post('/api/cambiar-clave', requireAuth, (req: any, res) => {
  try {
    const { claveNueva } = req.body;
    const user = req.user as UsuarioRecord;

    if (!claveNueva || typeof claveNueva !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Debe ingresar una nueva contraseña válida.',
      });
    }

    // Regla 4: mínimo 8 caracteres, al menos un número
    if (claveNueva.length < 8 || !/\d/.test(claveNueva)) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 8 caracteres y contener al menos un número.',
      });
    }

    const users = getUsuarios();
    const targetUser = users.find((u) => u.id === user.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    targetUser.passwordHash = bcrypt.hashSync(claveNueva, 10);
    targetUser.debeCambiarClave = false;
    saveUsuarios(users);

    registrarAuditoria('cambio_clave', targetUser.id, targetUser.usuario);

    return res.json({
      success: true,
      message: 'Contraseña actualizada con éxito.',
      user: safeUser(targetUser),
    });
  } catch (error: any) {
    console.error('Error en /api/cambiar-clave:', error);
    return res.status(500).json({ success: false, error: 'Error al cambiar contraseña.' });
  }
});

// ==================== COMPARADOR LOGIC & GEMINI ====================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ProposalInput {
  name: string;
  dataBase64: string;
  mimeType?: string;
}

interface ClientProfile {
  clientName: string;
  vehicle: string;
  maxBudget: number;
  mandatoryCoverages: string[];
  priorities: string;
  paymentMethod: string;
}

// Endpoint to load sample proposals - protected by requireAuth (Rule 5)
app.get('/api/sample-proposals', requireAuth, async (_req, res) => {
  try {
    const sampleDir = path.resolve(__dirname, 'public/assets/aistudio');
    if (!fs.existsSync(sampleDir)) {
      return res.status(404).json({ error: 'Directorio de ejemplos no encontrado.' });
    }

    const files = fs.readdirSync(sampleDir).filter((f) => f.endsWith('.pdf'));
    const samples = files.map((filename) => {
      const filePath = path.join(sampleDir, filename);
      const buffer = fs.readFileSync(filePath);
      const dataBase64 = buffer.toString('base64');

      let displayName = filename;
      if (filename.includes('Cordillera')) {
        displayName = 'Propuesta A - Aseguradora Cordillera';
      } else if (filename.includes('Alborada')) {
        displayName = 'Propuesta B - Seguros Alborada';
      } else if (filename.includes('Protectora')) {
        displayName = 'Propuesta C - Protectora del Valle';
      }

      return {
        id: filename,
        filename,
        displayName,
        size: buffer.length,
        mimeType: 'application/pdf',
        dataBase64,
      };
    });

    res.json({ samples });
  } catch (error: any) {
    console.error('Error al leer muestras:', error);
    res.status(500).json({ error: error.message || 'Error al cargar muestras.' });
  }
});

// Endpoint to analyze proposals using Gemini - protected by requireAuth (Rule 5)
app.post('/api/compare', requireAuth, async (req: any, res) => {
  try {
    const { proposals, profile } = req.body as {
      proposals: ProposalInput[];
      profile: ClientProfile;
    };

    if (!proposals || !Array.isArray(proposals) || proposals.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar al menos 1 propuesta PDF (hasta 3).' });
    }

    if (proposals.length > 3) {
      return res.status(400).json({ error: 'Máximo 3 propuestas permitidas simultáneamente.' });
    }

    if (!profile || !profile.clientName) {
      return res.status(400).json({ error: 'Faltan datos del perfil del cliente.' });
    }

    // Build parts for Gemini
    const parts: any[] = [];

    // System and context instructions (exact prompts preserved)
    const promptInstructions = `
Actúas como analista técnico senior de seguros para "Banco de Colombia".
Has recibido ${proposals.length} documento(s) PDF de propuestas de seguro voluntario de automóvil para el siguiente cliente:

DATOS DEL CLIENTE Y PERFIL:
- Nombre: ${profile.clientName}
- Vehículo y uso: ${profile.vehicle}
- Presupuesto máximo anual: ₡ ${Number(profile.maxBudget).toLocaleString('es-CR')} colones
- Coberturas obligatorias marcadas por el cliente: ${
      profile.mandatoryCoverages && profile.mandatoryCoverages.length > 0
        ? profile.mandatoryCoverages.join(', ')
        : 'Ninguna seleccionada'
    }
- Prioridades del cliente: ${profile.priorities || 'No indicadas'}
- Forma de pago preferida: ${profile.paymentMethod || 'No indicada'}

INSTRUCCIONES ESTRICTAS DE EXTRACCIÓN Y EVALUACIÓN:
1. Extraer de cada PDF SOLO lo que dice el documento; si un dato no aparece, escribir "no indicado". No inventar nada.
2. Extrae las siguientes 12 filas para cada aseguradora:
   - aseguradora: Nombre de la aseguradora y nombre del plan si aparece.
   - primaAnual: Monto exacto en colones con desglose si indica impuestos o IVA.
   - primaAnualMonto: Número puro aproximado en colones (ej. 395000, 455000) para comparaciones matemáticas.
   - cabeEnPresupuesto: Booleano (true si prima anual es menor o igual a ${profile.maxBudget}, false si es mayor).
   - cabeEnPresupuestoTexto: Texto explicativo breve (ej: "Sí (₡ 395.000 <= ₡ ${Number(
     profile.maxBudget
   ).toLocaleString('es-CR')})" o "No (se excede por ₡ X)").
   - deducibleColision: Deducible de colisión y vuelco exacto según el documento.
   - deducibleRobo: Deducible de robo total/parcial exacto según el documento.
   - rcDanosTerceros: Límite de responsabilidad civil daños a la propiedad/bienes de terceros.
   - rcLesiones: Límite de responsabilidad civil lesiones o muerte a terceros.
   - asistenciaVial247: Estado de la asistencia vial 24/7 (incluida, no incluida, o si requiere costo adicional).
   - grua: Cobertura y límite del servicio de grúa (ej: eventos al año, km).
   - vehiculoSustituto: Si incluye vehículo sustituto y condiciones (días) o si "no incluido".
   - fenomenosNaturales: Cobertura de fenómenos naturales (inundación, deslizamiento, etc.) (ej: "Suma asegurada", "No aplica / Excluido", "No cubre").
   - roturaCristales: Cobertura de rotura de cristales (ej: "₡ 300.000 por evento", "Sin límite, 1 evento sin deducible", "No cubre").
   - exclusionesDestacadas: Resumen de las exclusiones más relevantes mencionadas en la propuesta.
   - cumpleObligatorias: Booleano. Solo es true SI TODAS las coberturas obligatorias marcadas (${
     profile.mandatoryCoverages ? profile.mandatoryCoverages.join(', ') : ''
   }) están INCLUIDAS en la prima básica. OJO: Un paquete opcional con costo adicional (como "Asistencia Plus" con recargo) NO CUENTA como incluida.
   - cumpleObligatoriasTexto: Detalle breve de qué coberturas cumple o cuál le falta.
   - semaforo: Valor exacto "verde", "amarillo" o "rojo" según esta regla estricta:
     * "verde": si cabe en presupuesto y cumple todas las obligatorias.
     * "amarillo": si cumple todas las obligatorias pero no cabe en presupuesto.
     * "rojo": si NO cumple las obligatorias (independientemente del presupuesto).

3. RECOMENDACIÓN PRELIMINAR (BORRADOR):
   - Una sola propuesta recomendada.
   - Justificada en MÁXIMO 5 LÍNEAS con los montos explícitos, alineada a las prioridades del cliente.
   - Si una propuesta amarilla es mejor en las prioridades (por ejemplo, es la única que cubre fenómenos naturales o vehículo sustituto), DEBES DECIRLO CLARAMENTE y CUANTIFICAR LA DIFERENCIA DE PRIMA respecto al presupuesto (ej: "excede el presupuesto en ₡ 55.000 pero es la única que otorga la protección requerida").

4. MENSAJE SUGERIDO PARA EL CLIENTE (WHATSAPP):
   - Formato de mensaje WhatsApp (máximo 8 líneas).
   - Tono cordial, empático, sin tecnicismos complejos de seguros.
   - Incluye: saludo al cliente (${
     profile.clientName
   }), la recomendación principal, dos razones concretas, la alternativa (o advertencia de cobertura), y un próximo paso para revisar o ajustar.
   - IMPORTANTE: Sin prometer plazos ni tiempos de entrega ("en 24 horas", etc.).

Devuelve el resultado estrictamente en formato JSON válido de acuerdo al esquema solicitado.
`;

    parts.push({ text: promptInstructions });

    // Append each proposal PDF as inlineData
    proposals.forEach((p, index) => {
      parts.push({
        text: `\n--- DOCUMENTO PROPUESTA #${index + 1}: ${p.name} ---\n`,
      });
      parts.push({
        inlineData: {
          mimeType: p.mimeType || 'application/pdf',
          data: p.dataBase64,
        },
      });
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction:
          'Eres un perito experto en análisis de pólizas de seguros automotrices para Banco de Colombia. Tu análisis es riguroso, objetivo y apegado a la verdad contractual de los documentos sin inventar.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aseguradoras: {
              type: Type.ARRAY,
              description: 'Lista de análisis de cada propuesta PDF analizada',
              items: {
                type: Type.OBJECT,
                properties: {
                  nombreArchivo: { type: Type.STRING },
                  aseguradora: { type: Type.STRING },
                  plan: { type: Type.STRING },
                  primaAnual: { type: Type.STRING },
                  primaAnualMonto: { type: Type.NUMBER },
                  cabeEnPresupuesto: { type: Type.BOOLEAN },
                  cabeEnPresupuestoTexto: { type: Type.STRING },
                  deducibleColision: { type: Type.STRING },
                  deducibleRobo: { type: Type.STRING },
                  rcDanosTerceros: { type: Type.STRING },
                  rcLesiones: { type: Type.STRING },
                  asistenciaVial247: { type: Type.STRING },
                  grua: { type: Type.STRING },
                  vehiculoSustituto: { type: Type.STRING },
                  fenomenosNaturales: { type: Type.STRING },
                  roturaCristales: { type: Type.STRING },
                  exclusionesDestacadas: { type: Type.STRING },
                  cumpleObligatorias: { type: Type.BOOLEAN },
                  cumpleObligatoriasTexto: { type: Type.STRING },
                  semaforo: {
                    type: Type.STRING,
                    description: 'Color: "verde", "amarillo", o "rojo"',
                  },
                },
                required: [
                  'nombreArchivo',
                  'aseguradora',
                  'primaAnual',
                  'cabeEnPresupuesto',
                  'deducibleColision',
                  'deducibleRobo',
                  'rcDanosTerceros',
                  'rcLesiones',
                  'asistenciaVial247',
                  'grua',
                  'vehiculoSustituto',
                  'fenomenosNaturales',
                  'roturaCristales',
                  'exclusionesDestacadas',
                  'cumpleObligatorias',
                  'semaforo',
                ],
              },
            },
            recomendacionPreliminar: {
              type: Type.STRING,
              description: 'Máximo 5 líneas con montos y justificación',
            },
            mensajeWhatsApp: {
              type: Type.STRING,
              description: 'Máximo 8 líneas, tono cordial para WhatsApp sin tecnicismos ni plazos',
            },
          },
          required: ['aseguradoras', 'recomendacionPreliminar', 'mensajeWhatsApp'],
        },
      },
    });

    const rawJson = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawJson);
    } catch (parseErr) {
      console.error('Error parseando JSON de Gemini:', rawJson);
      throw new Error('Respuesta inválida del modelo de IA.');
    }

    // Safety verification: double check budget & mandatory flags deterministically
    if (parsedResult.aseguradoras && Array.isArray(parsedResult.aseguradoras)) {
      parsedResult.aseguradoras = parsedResult.aseguradoras.map((item: any) => {
        let semaforo = item.semaforo?.toLowerCase() || 'rojo';
        if (!['verde', 'amarillo', 'rojo'].includes(semaforo)) {
          if (item.cabeEnPresupuesto && item.cumpleObligatorias) {
            semaforo = 'verde';
          } else if (item.cumpleObligatorias && !item.cabeEnPresupuesto) {
            semaforo = 'amarillo';
          } else {
            semaforo = 'rojo';
          }
        }
        return {
          ...item,
          semaforo,
        };
      });
    }

    // Guardar comparación en data/comparaciones.json asociada al id del usuario (Regla 9)
    try {
      const comparaciones = fs.existsSync(comparacionesPath)
        ? JSON.parse(fs.readFileSync(comparacionesPath, 'utf-8'))
        : [];

      const comparisonRecord = {
        id: `comp-${Date.now()}`,
        fecha: new Date().toISOString(),
        usuarioId: req.user.id,
        usuarioNombre: req.user.nombreCompleto,
        usuarioLogin: req.user.usuario,
        clienteNombre: profile.clientName,
        vehiculo: profile.vehicle,
        presupuestoMaximo: profile.maxBudget,
        coberturasObligatorias: profile.mandatoryCoverages,
        aseguradorasAnalizadas: parsedResult.aseguradoras.map((a: any) => ({
          aseguradora: a.aseguradora,
          plan: a.plan,
          primaAnual: a.primaAnual,
          cabeEnPresupuesto: a.cabeEnPresupuesto,
          cumpleObligatorias: a.cumpleObligatorias,
          semaforo: a.semaforo,
        })),
        recomendacionPreliminar: parsedResult.recomendacionPreliminar,
      };

      comparaciones.unshift(comparisonRecord);
      fs.writeFileSync(comparacionesPath, JSON.stringify(comparaciones, null, 2), 'utf-8');

      // Auditoría
      registrarAuditoria('comparacion_creada', req.user.id, req.user.usuario, {
        comparacionId: comparisonRecord.id,
        cliente: profile.clientName,
        cantidadPropuestas: proposals.length,
      });
    } catch (saveErr) {
      console.error('Error guardando en data/comparaciones.json:', saveErr);
    }

    return res.json({
      success: true,
      data: parsedResult,
    });
  } catch (error: any) {
    console.error('Error en /api/compare:', error);
    return res.status(500).json({
      error: error.message || 'Ocurrió un error al procesar las propuestas.',
    });
  }
});

// Setup Vite dev server or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Comparador de Propuestas · Banco de Colombia corriendo en http://localhost:${port}`);
  });
}

setupServer();
