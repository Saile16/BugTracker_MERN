//importamos proyecto model para poder usarlo en el controlador
import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;
  const existeProyecto = await Proyecto.findById(proyecto);

  if (!existeProyecto) {
    const error = new Error("Project doesn't exist");
    return res.status(404).json({ msg: error.message });
  }

  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("You do not have permissions to add tasks");
    return res.status(401).json({ msg: error.message });
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);

    //Almacenamos la tarea en el proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id);
    await existeProyecto.save();

    res.status(200).json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const obtenerTareas = async (req, res) => {
  const { id } = req.params;

  //el populate es para traer los datos del proyecto como en este caso el creador
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("The task does not exist");
    return res.status(404).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Invalid Action");
    return res.status(403).json({ msg: error.message });
  }

  res.json(tarea);
};
const actualizarTarea = async (req, res) => {
  const { id } = req.params;

  //el populate es para traer los datos del proyecto como en este caso el creador
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("The task does not exist");
    return res.status(404).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Invalid Action");
    return res.status(403).json({ msg: error.message });
  }

  //esta es la lógica de editar la tarea
  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

  try {
    const tareaAlmacenada = await tarea.save();
    res.json(tareaAlmacenada);
  } catch (error) {}
};
const eliminarTarea = async (req, res) => {
  const { id } = req.params;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    //el populate es para traer los datos del proyecto como en este caso el creador
    const tarea = await Tarea.findById(id.trim()).populate("proyecto");
    if (!tarea) {
      const error = new Error("The task does not exist");
      return res.status(404).json({ msg: error.message });
    }
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Invalid Action");
      return res.status(403).json({ msg: error.message });
    }

    try {
      const proyecto = await Proyecto.findById(tarea.proyecto);
      proyecto.tareas.pull(tarea._id);

      await Promise.allSettled([
        await proyecto.save(),
        await tarea.deleteOne(),
      ]);

      res.json({ msg: "Task has been deleted" });
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error("Invalid Id");
    return res.status(404).json({ msg: error.message });
  }
};

const cambiarEstadoTarea = async (req, res) => {
  const { id } = req.params;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const tarea = await Tarea.findById(id.trim()).populate("proyecto");

    if (!tarea) {
      const error = new Error("The task does not exist");
      return res.status(404).json({ msg: error.message });
    }

    if (
      tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
      !tarea.proyecto.colaboradores.some(
        (colaborador) =>
          colaborador._id.toString() === req.usuario._id.toString()
      )
    ) {
      const error = new Error("Invalid Action");
      return res.status(403).json({ msg: error.message });
    }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id;
    await tarea.save();
    const tareaAlmacenada = await Tarea.findById(id.trim())
      .populate("proyecto")
      .populate("completado");

    res.json(tareaAlmacenada);
  } else {
    const error = new Error("Invalid Id");
    return res.status(404).json({ msg: error.message });
  }
};

export {
  agregarTarea,
  obtenerTareas,
  actualizarTarea,
  eliminarTarea,
  cambiarEstadoTarea,
};
