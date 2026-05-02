// features/dashboard/domain/dashboard.model.ts

export interface AdminDashboard {
  totalClientes: number;
  totalUsuarios: number;
  totalVentas: number;
  alertasPendientes: number;
  oportunidadesActivas: number;
  oportunidadesGanadas: number;
  oportunidadesPerdidas: number;
  valorOportunidadesGanadas: number;
  // Embudo
  enProspeccion: number;
  enCalificacion: number;
  enPropuesta: number;
  enNegociacion: number;
  enCierreGanado: number;
  enCierrePerdido: number;
}

export interface GerenteDashboard {
  totalClientes: number;
  totalVentas: number;
  oportunidadesActivas: number;
  oportunidadesGanadas: number;
  oportunidadesPerdidas: number;
  valorOportunidadesGanadas: number;
  enProspeccion: number;
  enCalificacion: number;
  enPropuesta: number;
  enNegociacion: number;
  enCierreGanado: number;
  enCierrePerdido: number;
}

// features/dashboard/domain/dashboard.model.ts

export interface AdminDashboard {
  totalClientes: number;
  totalUsuarios: number;
  totalVentas: number;
  alertasPendientes: number;
  oportunidadesActivas: number;
  oportunidadesGanadas: number;
  oportunidadesPerdidas: number;
  valorOportunidadesGanadas: number;
  // Embudo
  enProspeccion: number;
  enCalificacion: number;
  enPropuesta: number;
  enNegociacion: number;
  enCierreGanado: number;
  enCierrePerdido: number;
}

export interface GerenteDashboard {
  totalClientes: number;
  totalVentas: number;
  oportunidadesActivas: number;
  oportunidadesGanadas: number;
  oportunidadesPerdidas: number;
  valorOportunidadesGanadas: number;
  enProspeccion: number;
  enCalificacion: number;
  enPropuesta: number;
  enNegociacion: number;
  enCierreGanado: number;
  enCierrePerdido: number;
}

export interface AsesorDashboard {
  misOportunidades: number;
  misOportunidadesActivas: number;
  misOportunidadesGanadas: number;
  misOportunidadesPerdidas: number;
  miValorGanado: number;
  misAlertasPendientes: number; // ← agrega este
  enProspeccion: number;
  enCalificacion: number;
  enPropuesta: number;
  enNegociacion: number;
  enCierreGanado: number;
  enCierrePerdido: number;
}
