import { AppDataSource } from '../config/configDb.js';
import { CajaEntity } from '../entities/caja.entity.js';
import { JornadaEntity } from '../entities/jornada.entity.js';
import { PedidoEntity } from '../entities/pedido.entity.js';
import { GastoEntity } from '../entities/gasto.entity.js';

const cajaRepository = AppDataSource.getRepository(CajaEntity);
const jornadaRepository = AppDataSource.getRepository(JornadaEntity);
const pedidoRepository = AppDataSource.getRepository(PedidoEntity);
const gastoRepository = AppDataSource.getRepository(GastoEntity);

// calcula ingresos y salidas desde que se abrio la caja hasta ahora (o hasta el cierre)
async function calcularMovimientos(caja) {
  const desde = caja.fechaApertura;
  const hasta = caja.fechaCierre || new Date();

  const pedidosPagados = await pedidoRepository
    .createQueryBuilder('pedido')
    .where('pedido.jornada_id = :jornadaId', { jornadaId: caja.jornada.id })
    .andWhere('pedido.estado_pago = :estado', { estado: 'validado' })
    .andWhere('pedido.fecha_pedido BETWEEN :desde AND :hasta', { desde, hasta })
    .getMany();

  const gastosRegistrados = await gastoRepository
    .createQueryBuilder('gasto')
    .where('gasto.jornada_id = :jornadaId', { jornadaId: caja.jornada.id })
    .andWhere('gasto.fecha_registro BETWEEN :desde AND :hasta', { desde, hasta })
    .getMany();

  return {
    ingresos: pedidosPagados.reduce((acc, p) => acc + p.total, 0),
    salidas: gastosRegistrados.reduce((acc, g) => acc + g.monto, 0),
    cantidadPedidos: pedidosPagados.length,
    cantidadGastos: gastosRegistrados.length,
  };
}

export async function obtenerCajaPorJornada(req, res) {
  try {
    const { jornada_id } = req.query;
    if (!jornada_id) {
      return res.status(400).json({ success: false, mensaje: "Debes indicar la jornada a consultar" });
    }

    const caja = await cajaRepository.findOne({
      where: { jornada: { id: Number(jornada_id) } },
      relations: ['jornada'],
      order: { id: 'DESC' },
    });

    if (!caja) {
      return res.status(200).json({ success: true, data: null });
    }

    const movimientos = await calcularMovimientos(caja);
    const saldoFinalTeorico = caja.saldoInicial + movimientos.ingresos - movimientos.salidas;

    return res.status(200).json({
      success: true,
      data: { ...caja, ...movimientos, saldoFinalTeorico },
    });
  } catch (error) {
    console.error("Error en obtenerCajaPorJornada:", error);
    return res.status(500).json({ success: false, mensaje: "Error al consultar la caja" });
  }
}

// solo la dueña abre caja
export async function abrirCaja(req, res) {
  try {
    const { jornada_id, saldoInicial } = req.body;

    const jornada = await jornadaRepository.findOneBy({ id: Number(jornada_id) });
    if (!jornada) {
      return res.status(404).json({ success: false, mensaje: "La jornada seleccionada no existe" });
    }

    const cajaAbierta = await cajaRepository.findOne({
      where: { jornada: { id: jornada.id }, estado: 'abierta' },
    });
    if (cajaAbierta) {
      return res.status(400).json({ success: false, mensaje: "Ya hay una caja abierta para esta jornada" });
    }

    const nuevaCaja = cajaRepository.create({
      saldoInicial: Number(saldoInicial),
      estado: 'abierta',
      fechaApertura: new Date(),
      jornada: { id: jornada.id },
    });
    await cajaRepository.save(nuevaCaja);

    return res.status(201).json({ success: true, mensaje: "Caja abierta con éxito", data: nuevaCaja });
  } catch (error) {
    console.error("Error en abrirCaja:", error);
    return res.status(500).json({ success: false, mensaje: "Error interno al abrir la caja" });
  }
}

// solo la dueña cierra caja
export async function cerrarCaja(req, res) {
  try {
    const { id } = req.params;
    const { saldoFinalContado } = req.body;

    const caja = await cajaRepository.findOne({ where: { id: Number(id) }, relations: ['jornada'] });
    if (!caja) {
      return res.status(404).json({ success: false, mensaje: "La caja especificada no existe" });
    }
    if (caja.estado === 'cerrada') {
      return res.status(400).json({ success: false, mensaje: "Esta caja ya fue cerrada anteriormente" });
    }

    caja.fechaCierre = new Date();
    const { ingresos, salidas } = await calcularMovimientos(caja);
    const saldoFinalTeorico = caja.saldoInicial + ingresos - salidas;

    caja.saldoFinalTeorico = saldoFinalTeorico;
    caja.saldoFinalContado = Number(saldoFinalContado);
    caja.diferencia = caja.saldoFinalContado - saldoFinalTeorico;
    caja.estado = 'cerrada';

    await cajaRepository.save(caja);

    return res.status(200).json({
      success: true,
      mensaje: caja.diferencia === 0
        ? "¡Caja cerrada, el efectivo cuadra perfecto!"
        : `Caja cerrada con una diferencia de $${Math.abs(caja.diferencia)} (${caja.diferencia > 0 ? 'sobrante' : 'faltante'})`,
      data: caja,
    });
  } catch (error) {
    console.error("Error en cerrarCaja:", error);
    return res.status(500).json({ success: false, mensaje: "Error interno al cerrar la caja" });
  }
}

export async function obtenerHistorialCajas(req, res) {
  try {
    const cajas = await cajaRepository.find({ relations: ['jornada'], order: { id: 'DESC' } });
    return res.status(200).json({ success: true, data: cajas });
  } catch (error) {
    console.error("Error en obtenerHistorialCajas:", error);
    return res.status(500).json({ success: false, mensaje: "Error al obtener el historial de cajas" });
  }
}