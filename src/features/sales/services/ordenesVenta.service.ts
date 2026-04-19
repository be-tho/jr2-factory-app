import { supabase } from '../../../lib/supabase/client'
import type { MedioPagoVenta } from '../../../types/database'

const TABLE_ORDEN = 'ordenes_venta'
const TABLE_ITEMS = 'ordenes_venta_items'

export type CreateOrdenVentaItemInput = {
  articulo_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export type CreateOrdenVentaInput = {
  cliente_nombre: string
  cliente_telefono: string | null
  medio_pago: MedioPagoVenta
  items: CreateOrdenVentaItemInput[]
}

export async function createOrdenVenta(
  input: CreateOrdenVentaInput,
): Promise<{ data: { id: string } | null; error: Error | null }> {
  const nombre = input.cliente_nombre.trim()
  if (nombre.length < 2) return { data: null, error: new Error('Ingresá el nombre del cliente.') }
  if (!input.items.length) return { data: null, error: new Error('El carrito está vacío.') }

  const total = input.items.reduce((s, i) => s + i.subtotal, 0)
  if (total <= 0) return { data: null, error: new Error('El total de la venta no es válido.') }

  const { data: orden, error: e1 } = await supabase
    .from(TABLE_ORDEN)
    .insert({
      cliente_nombre: nombre,
      cliente_telefono: input.cliente_telefono?.trim() || null,
      medio_pago: input.medio_pago,
      total,
      estado: 'confirmada',
    })
    .select('id')
    .single()

  if (e1 || !orden) {
    return { data: null, error: new Error(e1?.message ?? 'No se pudo crear la orden.') }
  }

  const ordenId = (orden as { id: string }).id

  const rows = input.items.map((i) => ({
    orden_id: ordenId,
    articulo_id: i.articulo_id,
    cantidad: i.cantidad,
    precio_unitario: i.precio_unitario,
    subtotal: i.subtotal,
  }))

  const { error: e2 } = await supabase.from(TABLE_ITEMS).insert(rows)

  if (e2) {
    await supabase.from(TABLE_ORDEN).delete().eq('id', ordenId)
    return { data: null, error: new Error(e2.message) }
  }

  return { data: { id: ordenId }, error: null }
}
