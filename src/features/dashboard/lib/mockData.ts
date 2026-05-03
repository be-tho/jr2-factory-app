import type { CorteEstado, Product, Patron } from '../../../types/database'

// ─── Mock Artículos ────────────────────────────────────────────────────

export function getMockProducts(): Product[] {
  return [
    {
      id: 'mock-1',
      name: 'Remera Básica Classic',
      sku: 'REM-001',
      slug: 'remera-basica-classic',
      category: 'Remeras',
      temporada: 'Verano 2026',
      categoria_id: 'cat-1',
      temporada_id: 'temp-1',
      precio_lista: 15000,
      precio_promocional: 12000,
      stock_actual: 45,
      descripcion: 'Remera básica de algodón',
      activo: true,
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-04-20T10:00:00Z',
      cover_image_path: null,
    },
    {
      id: 'mock-2',
      name: 'Camisa Formal Slim',
      sku: 'CAM-002',
      slug: 'camisa-formal-slim',
      category: 'Camisas',
      temporada: 'Invierno 2026',
      categoria_id: 'cat-2',
      temporada_id: 'temp-2',
      precio_lista: 35000,
      precio_promocional: null,
      stock_actual: 8,
      descripcion: 'Camisa formal corte slim fit',
      activo: true,
      created_at: '2026-02-10T10:00:00Z',
      updated_at: '2026-04-18T10:00:00Z',
      cover_image_path: null,
    },
    {
      id: 'mock-3',
      name: 'Pantalón Chino',
      sku: 'PAN-003',
      slug: 'pantalon-chino',
      category: 'Pantalones',
      temporada: 'Verano 2026',
      categoria_id: 'cat-3',
      temporada_id: 'temp-1',
      precio_lista: 28000,
      precio_promocional: 23000,
      stock_actual: 0,
      descripcion: 'Pantalón chino corte regular',
      activo: true,
      created_at: '2026-01-20T10:00:00Z',
      updated_at: '2026-04-15T10:00:00Z',
      cover_image_path: null,
    },
    {
      id: 'mock-4',
      name: 'Vestido Floral Midi',
      sku: 'VES-004',
      slug: 'vestido-floral-midi',
      category: 'Vestidos',
      temporada: 'Primavera 2026',
      categoria_id: 'cat-4',
      temporada_id: 'temp-3',
      precio_lista: 42000,
      precio_promocional: null,
      stock_actual: 22,
      descripcion: 'Vestido floral corte midi',
      activo: true,
      created_at: '2026-03-05T10:00:00Z',
      updated_at: '2026-04-22T10:00:00Z',
      cover_image_path: null,
    },
    {
      id: 'mock-5',
      name: 'Buzo Oversize',
      sku: 'BUZ-005',
      slug: 'buzo-oversize',
      category: 'Buzos',
      temporada: 'Invierno 2026',
      categoria_id: 'cat-5',
      temporada_id: 'temp-2',
      precio_lista: 32000,
      precio_promocional: 28000,
      stock_actual: 3,
      descripcion: 'Buzo corte oversize de felpa',
      activo: false,
      created_at: '2026-02-28T10:00:00Z',
      updated_at: '2026-04-10T10:00:00Z',
      cover_image_path: null,
    },
    {
      id: 'mock-6',
      name: 'Falda Plisada',
      sku: 'FAL-006',
      slug: 'falda-plisada',
      category: 'Faldas',
      temporada: 'Primavera 2026',
      categoria_id: 'cat-6',
      temporada_id: 'temp-3',
      precio_lista: 25000,
      precio_promocional: null,
      stock_actual: 15,
      descripcion: 'Falda plisada midi',
      activo: true,
      created_at: '2026-03-15T10:00:00Z',
      updated_at: '2026-04-21T10:00:00Z',
      cover_image_path: null,
    },
  ]
}

// ─── Mock Cortes ────────────────────────────────────────────────────────

interface MockCorteArticulo {
  articulo_id: string
  nombre: string
  codigo: string
  cover_image_path: string | null
}

interface MockCorteColor {
  id: string
  color: string
  cantidad: number
}

export function getMockCortes(): (Omit<import('../../../types/database').Corte, 'articulos' | 'colores'> & {
  articulos: MockCorteArticulo[]
  colores: MockCorteColor[]
})[] {
  return [
    {
      id: 'mock-corte-1',
      numero_corte: 'C-001',
      tipo_tela: 'Algodón',
      cantidad_total: 50,
      costureros: 'María González',
      estado: 'en_proceso' as CorteEstado,
      fecha: '2026-04-25',
      descripcion: 'Corte inicial de remeras',
      imagen_path: null,
      created_at: '2026-04-25T10:00:00Z',
      updated_at: '2026-04-25T10:00:00Z',
      articulos: [
        { articulo_id: 'mock-1', nombre: 'Remera Básica Classic', codigo: 'REM-001', cover_image_path: null },
      ],
      colores: [
        { id: 'col-1', color: 'Blanco', cantidad: 25 },
        { id: 'col-2', color: 'Negro', cantidad: 25 },
      ],
    },
    {
      id: 'mock-corte-2',
      numero_corte: 'C-002',
      tipo_tela: 'Lino',
      cantidad_total: 30,
      costureros: 'Juan Pérez',
      estado: 'pendiente' as CorteEstado,
      fecha: '2026-04-28',
      descripcion: 'Corte de camisas formal',
      imagen_path: null,
      created_at: '2026-04-28T10:00:00Z',
      updated_at: '2026-04-28T10:00:00Z',
      articulos: [
        { articulo_id: 'mock-2', nombre: 'Camisa Formal Slim', codigo: 'CAM-002', cover_image_path: null },
      ],
      colores: [
        { id: 'col-3', color: 'Azul marino', cantidad: 15 },
        { id: 'col-4', color: 'Blanco', cantidad: 15 },
      ],
    },
    {
      id: 'mock-corte-3',
      numero_corte: 'C-003',
      tipo_tela: 'Gabardina',
      cantidad_total: 40,
      costureros: 'Ana López',
      estado: 'completado' as CorteEstado,
      fecha: '2026-04-20',
      descripcion: 'Corte de pantalones',
      imagen_path: null,
      created_at: '2026-04-20T10:00:00Z',
      updated_at: '2026-04-23T10:00:00Z',
      articulos: [
        { articulo_id: 'mock-3', nombre: 'Pantalón Chino', codigo: 'PAN-003', cover_image_path: null },
      ],
      colores: [
        { id: 'col-5', color: 'Beige', cantidad: 20 },
        { id: 'col-6', color: 'Navy', cantidad: 20 },
      ],
    },
    {
      id: 'mock-corte-4',
      numero_corte: 'C-004',
      tipo_tela: 'Viscosa',
      cantidad_total: 25,
      costureros: null,
      estado: 'pendiente' as CorteEstado,
      fecha: '2026-04-30',
      descripcion: 'Corte de vestidos',
      imagen_path: null,
      created_at: '2026-04-30T10:00:00Z',
      updated_at: '2026-04-30T10:00:00Z',
      articulos: [
        { articulo_id: 'mock-4', nombre: 'Vestido Floral Midi', codigo: 'VES-004', cover_image_path: null },
      ],
      colores: [
        { id: 'col-7', color: 'Floral rosado', cantidad: 25 },
      ],
    },
    {
      id: 'mock-corte-5',
      numero_corte: 'C-005',
      tipo_tela: 'Felpilla',
      cantidad_total: 35,
      costureros: 'María González',
      estado: 'cancelado' as CorteEstado,
      fecha: '2026-04-15',
      descripcion: 'Corte cancelado',
      imagen_path: null,
      created_at: '2026-04-15T10:00:00Z',
      updated_at: '2026-04-16T10:00:00Z',
      articulos: [
        { articulo_id: 'mock-5', nombre: 'Buzo Oversize', codigo: 'BUZ-005', cover_image_path: null },
      ],
      colores: [
        { id: 'col-8', color: 'Gris', cantidad: 35 },
      ],
    },
  ]
}

// ─── Mock Patrones ──────────────────────────────────────────────────────

export function getMockPatrones(): Patron[] {
  return [
    {
      id: 'mock-patron-1',
      articulo_id: 'mock-1',
      nombre: 'Patrón Remera Classic',
      descripcion: 'Patrón base para remera básica',
      storage_path: '/patrones/remera-classic.pdf',
      image_path: null,
      file_name: 'remera-classic.pdf',
      file_size: 2500000,
      file_type: 'application/pdf',
      activo: true,
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-01-15T10:00:00Z',
      articulo_nombre: 'Remera Básica Classic',
      articulo_sku: 'REM-001',
    },
    {
      id: 'mock-patron-2',
      articulo_id: 'mock-2',
      nombre: 'Patrón Camisa Slim',
      descripcion: 'Patrón para camisa corte slim',
      storage_path: '/patrones/camisa-slim.pdf',
      image_path: null,
      file_name: 'camisa-slim.pdf',
      file_size: 3200000,
      file_type: 'application/pdf',
      activo: true,
      created_at: '2026-02-10T10:00:00Z',
      updated_at: '2026-02-10T10:00:00Z',
      articulo_nombre: 'Camisa Formal Slim',
      articulo_sku: 'CAM-002',
    },
    {
      id: 'mock-patron-3',
      articulo_id: 'mock-3',
      nombre: 'Patrón Pantalón Chino',
      descripcion: 'Patrón base para pantalón chino',
      storage_path: '/patrones/pantalon-chino.pdf',
      image_path: null,
      file_name: 'pantalon-chino.pdf',
      file_size: 2800000,
      file_type: 'application/pdf',
      activo: false,
      created_at: '2026-01-20T10:00:00Z',
      updated_at: '2026-03-15T10:00:00Z',
      articulo_nombre: 'Pantalón Chino',
      articulo_sku: 'PAN-003',
    },
    {
      id: 'mock-patron-4',
      articulo_id: 'mock-4',
      nombre: 'Patrón Vestido Floral',
      descripcion: 'Patrón para vestido floral midi',
      storage_path: '/patrones/vestido-floral.pdf',
      image_path: null,
      file_name: 'vestido-floral.pdf',
      file_size: 3500000,
      file_type: 'application/pdf',
      activo: true,
      created_at: '2026-03-05T10:00:00Z',
      updated_at: '2026-03-05T10:00:00Z',
      articulo_nombre: 'Vestido Floral Midi',
      articulo_sku: 'VES-004',
    },
  ]
}
