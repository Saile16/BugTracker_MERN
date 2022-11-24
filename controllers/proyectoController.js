import Proyecto from "../models/Proyecto.js";

import Usuario from "../models/Usuario.js";
const obtenerProyectos = async (req, res) => {
  //de estas 2 maneras puedes obtener los proyectos de un usuario determnado
  // const proyectos = await Proyecto.find({ creador: req.usuario._id });
  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  })
    // .where("creador")
    // .equals(req.usuario)
    .select("-tareas");
  res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

const obtenerProyecto = async (req, res) => {
  const { id } = req.params;
  //buscamos el proyecto por el id
  //recordar que el populate es para traer los datos de la referencia que se le indique
  const proyecto = await Proyecto.findById(id)
    .populate({
      path: "tareas",
      populate: { path: "completado", select: "nombre" },
    })
    // .populate("tareas")
    .populate("colaboradores", "nombre email");

  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  if (
    proyecto.creador.toString() !== req.usuario._id.toString() &&
    !proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Acción no válida");
    return res.status(401).json({ msg: error.message });
  }

  // //Obtener las tareas del proyecto
  // const tareas = await Tarea.find().where("proyecto").equals(proyecto._id);
  // res.json({
  //   proyecto,
  //   tareas,
  // });

  res.json(proyecto);
};

const editarProyecto = async (req, res) => {
  const { id } = req.params;
  //buscamos el proyecto por el id
  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error("Project not found");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Invalid Cction");
    return res.status(401).json({ msg: error.message });
  }

  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;
  //buscamos el proyecto por el id
  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error("Project not found");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Invalid Action");
    return res.status(401).json({ msg: error.message });
  }

  try {
    await proyecto.deleteOne();
    res.json({ msg: "Deleted Project" });
  } catch (error) {
    console.log(error);
  }
};

const buscarColaborador = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  if (!usuario) {
    const error = new Error("User not found");
    return res.status(404).json({ msg: error.message });
  }

  res.json(usuario);
};

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error("Project not found");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Invalid Action");
    return res.status(401).json({ msg: error.message });
  }

  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  if (!usuario) {
    const error = new Error("User not found");
    return res.status(404).json({ msg: error.message });
  }

  //El colaborador no es el admin del proyecto
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error("The owner cannot be the project collaborator");
    return res.status(401).json({ msg: error.message });
  }

  //Revisar que no este ya agregado al proyecto
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("The user is already added to the project");
    return res.status(401).json({ msg: error.message });
  }

  ///Agregar ahora al colaborador
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({ msg: "User added successfully" });
};

const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error("Project not found");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Invalid Action");
    return res.status(401).json({ msg: error.message });
  }

  //Esta bien se puede eliminar

  proyecto.colaboradores.pull(req.body.id);
  await proyecto.save();
  res.json({ msg: "User Removed Successfully" });
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
};
