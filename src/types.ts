export interface UserSession {
  id: string;
  usuario: string;
  nombreCompleto: string;
  rol: 'administrador' | 'asesor';
  estado: 'activo' | 'suspendido';
  debeCambiarClave: boolean;
  ultimoAcceso: string | null;
}

export interface ProposalFile {
  id: string;
  name: string;
  displayName?: string;
  size: number;
  dataBase64: string;
  mimeType: string;
  isSample?: boolean;
}

export interface ClientProfile {
  clientName: string;
  vehicle: string;
  maxBudget: number | '';
  mandatoryCoverages: string[];
  priorities: string;
  paymentMethod: string;
}

export interface InsurerAnalysis {
  nombreArchivo: string;
  aseguradora: string;
  plan?: string;
  primaAnual: string;
  primaAnualMonto?: number;
  cabeEnPresupuesto: boolean;
  cabeEnPresupuestoTexto?: string;
  deducibleColision: string;
  deducibleRobo: string;
  rcDanosTerceros: string;
  rcLesiones: string;
  asistenciaVial247: string;
  grua: string;
  vehiculoSustituto: string;
  fenomenosNaturales: string;
  roturaCristales: string;
  exclusionesDestacadas: string;
  cumpleObligatorias: boolean;
  cumpleObligatoriasTexto?: string;
  semaforo: 'verde' | 'amarillo' | 'rojo' | string;
}

export interface ComparisonResponse {
  aseguradoras: InsurerAnalysis[];
  recomendacionPreliminar: string;
  mensajeWhatsApp: string;
}
