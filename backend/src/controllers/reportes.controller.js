import { AppDataSource } from '../config/configDb.js';
import { JornadaEntity } from '../entities/jornada.entity.js';
import { PedidoEntity } from '../entities/pedido.entity.js';
import { DetallePedidoEntity } from '../entities/detallePedido.entity.js';
import { GastoEntity } from '../entities/gasto.entity.js';

const jornadaRepository = AppDataSource.getRepository(JornadaEntity);
const pedidoRepository = AppDataSource.getRepository(PedidoEntity);
const detalleRepository = AppDataSource.getRepository(DetallePedidoEntity);
const gastoRepository = AppDataSource.getRepository(GastoEntity);


function claveSemanaISO(fecha) {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function claveMes(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
}

// reporte completo de una jornada puntual: ventas por método de pago y por producto
export async function obtenerReporteJornada(req, res) {
  try {
    const { jornada_id } = req.params;

    const jornada = await jornadaRepository.findOneBy({ id: Number(jornada_id) });
    if (!jornada) {
      return res.status(404).json({ success: false, mensaje: "La jornada indicada no existe" });
    }

    const pedidosValidados = await pedidoRepository.find({
      where: { jornada: { id: jornada.id }, estadoPago: 'validado' },
    });

    const totalVentas = pedidosValidados.reduce((acc, p) => acc + p.total, 0);

    const ventasPorMetodo = pedidosValidados.reduce((acc, p) => {
      acc[p.metodoPago] = (acc[p.metodoPago] || 0) + p.total;
      return acc;
    }, {});

    const detalles = await detalleRepository
      .createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')
      .innerJoin('detalle.pedido', 'pedido')
      .where('pedido.jornada_id = :jornadaId', { jornadaId: jornada.id })
      .andWhere('pedido.estado_pago = :estado', { estado: 'validado' })
      .getMany();

    const mapaProductos = {};
    for (const d of detalles) {
      const nombre = d.producto?.nombre || 'Producto eliminado';
      const subtotal = d.cantidad * d.precioUnitario;
      if (!mapaProductos[nombre]) {
        mapaProductos[nombre] = { nombre, cantidad: 0, monto: 0 };
      }
      mapaProductos[nombre].cantidad += d.cantidad;
      mapaProductos[nombre].monto += subtotal;
    }
    const ventasPorProducto = Object.values(mapaProductos).sort((a, b) => b.monto - a.monto);

    const gastos = await gastoRepository.find({ where: { jornada: { id: jornada.id } } });
    const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);

    return res.status(200).json({
      success: true,
      data: {
        jornadaId: jornada.id,
        fechaInicio: jornada.fechaInicio,
        fechaFin: jornada.fechaFin,
        totalVentas,
        totalGastos,
        gananciaReal: totalVentas - totalGastos,
        cantidadPedidos: pedidosValidados.length,
        ventasPorMetodo,
        ventasPorProducto,
      },
    });
  } catch (error) {
    console.error("Error en obtenerReporteJornada:", error);
    return res.status(500).json({ success: false, mensaje: "Error al generar el reporte de la jornada" });
  }
}

// resumen agrupado por semana o por mes, en base a todas las jornadas registradas
export async function obtenerResumenPeriodo(req, res) {
  try {
    const { tipo = 'semanal' } = req.query;

    const jornadas = await jornadaRepository.find({ order: { fechaInicio: 'ASC' } });
    if (jornadas.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const pedidosValidados = await pedidoRepository.find({
      where: { estadoPago: 'validado' },
      relations: ['jornada'],
    });
    const gastos = await gastoRepository.find({ relations: ['jornada'] });

    const totalesPorJornada = {};
    for (const j of jornadas) {
      totalesPorJornada[j.id] = { ventas: 0, gastos: 0, fecha: j.fechaInicio };
    }
    for (const p of pedidosValidados) {
      if (p.jornada && totalesPorJornada[p.jornada.id]) {
        totalesPorJornada[p.jornada.id].ventas += p.total;
      }
    }
    for (const g of gastos) {
      if (g.jornada && totalesPorJornada[g.jornada.id]) {
        totalesPorJornada[g.jornada.id].gastos += g.monto;
      }
    }

    const grupos = {};
    for (const jid in totalesPorJornada) {
      const { ventas, gastos: gastosJornada, fecha } = totalesPorJornada[jid];
      const fechaObj = new Date(fecha);
      const clave = tipo === 'mensual' ? claveMes(fechaObj) : claveSemanaISO(fechaObj);

      if (!grupos[clave]) {
        grupos[clave] = { periodo: clave, ventas: 0, gastos: 0, cantidadJornadas: 0 };
      }
      grupos[clave].ventas += ventas;
      grupos[clave].gastos += gastosJornada;
      grupos[clave].cantidadJornadas += 1;
    }

    const resultado = Object.values(grupos)
      .map((g) => ({ ...g, gananciaReal: g.ventas - g.gastos }))
      .sort((a, b) => (a.periodo > b.periodo ? 1 : -1));

    return res.status(200).json({ success: true, data: resultado });
  } catch (error) {
    console.error("Error en obtenerResumenPeriodo:", error);
    return res.status(500).json({ success: false, mensaje: "Error al generar el resumen por periodo" });
  }
}
