import { AppDataSource } from '../config/configDb.js';
import { GastoEntity } from '../entities/gasto.entity.js';
import { JornadaEntity } from '../entities/jornada.entity.js';

const gastoRepository = AppDataSource.getRepository(GastoEntity);
const jornadaRepository = AppDataSource.getRepository(JornadaEntity);

export async function crearGasto(req, res) {
  try {
    const { nombreOperacion, categoria, metodoPago, monto, jornada_id } = req.body;

    const jornada = await jornadaRepository.findOneBy({ id: Number(jornada_id) });
    if (!jornada) {
      return res.status(404).json({ success: false, mensaje: "La jornada seleccionada no existe." });
    }

    const comprobanteUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

    const nuevoGasto = gastoRepository.create({
      nombreOperacion,
      categoria,
      metodoPago,
      monto: Number(monto),
      comprobanteUrl,
      fechaRegistro: new Date(),
      estadoReembolso: metodoPago === 'terceros' ? 'pendiente' : null,
      jornada: { id: jornada.id },
      usuario: req.usuario?.id ? { id: req.usuario.id } : null, // viene del JWT, no del body
    });

    await gastoRepository.save(nuevoGasto);

    return res.status(201).json({
      success: true,
      mensaje: "Gasto registrado con éxito",
      data: nuevoGasto,
    });
  } catch (error) {
    console.error("Error en crearGasto:", error);
    return res.status(500).json({ success: false, mensaje: "Error interno al registrar el gasto" });
  }
}

export async function obtenerGastos(req, res) {
  try {
    const { jornada_id, soloReembolsos } = req.query;
    const where = {};
    if (jornada_id) where.jornada = { id: Number(jornada_id) };
    if (soloReembolsos === 'true') where.metodoPago = 'terceros';

    const gastos = await gastoRepository.find({
      where,
      relations: ['jornada', 'usuario'],
      order: { fechaRegistro: 'DESC' },
    });

    return res.status(200).json({ success: true, data: gastos });
  } catch (error) {
    console.error("Error en obtenerGastos:", error);
    return res.status(500).json({ success: false, mensaje: "Error al obtener los gastos" });
  }
}

// solo la dueña puede ejecutar esto (se restringe también en la ruta)
export async function marcarReembolsoHecho(req, res) {
  try {
    const { id } = req.params;
    const gasto = await gastoRepository.findOneBy({ id: Number(id) });

    if (!gasto) {
      return res.status(404).json({ success: false, mensaje: "El gasto especificado no existe" });
    }
    if (gasto.metodoPago !== 'terceros') {
      return res.status(400).json({ success: false, mensaje: "Este gasto no es de dinero de terceros; no requiere reembolso." });
    }

    gasto.estadoReembolso = 'reembolsado';
    gasto.fechaReembolso = new Date();
    await gastoRepository.save(gasto);

    return res.status(200).json({ success: true, mensaje: "Reembolso marcado como realizado", data: gasto });
  } catch (error) {
    console.error("Error en marcarReembolsoHecho:", error);
    return res.status(500).json({ success: false, mensaje: "Error al marcar el reembolso" });
  }
}