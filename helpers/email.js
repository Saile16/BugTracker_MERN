import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //Información del email
  const info = await transport.sendMail({
    from: '"BugTracker - Adminitrador de BugTracker" <cuentas@mybugtracker.com>',
    to: email,
    subject: "BugTracker - Confirma tu cuenta",
    text: "Comprueba tu cuenta en BugTracker",
    html: `
    <p>Hola: ${nombre} Comprueba tu cuenta en BugTracker</p>
    <p>Tu cuenta ya está casi lista, solo debes comprobarla en el siguiente enlance:

    <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar cuenta</a>

    <p>Si tu no has creado una cuenta en BugTracker, ignora este email</p>
    `,
  });
};

export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //Información del email
  const info = await transport.sendMail({
    from: '"BugTracker - Adminitrador de BugTracker" <cuentas@mybugtracker.com>',
    to: email,
    subject: "BugTracker - Reestablece tu password",
    text: "Comprueba tu cuenta en BugTracker",
    html: `
    <p>Hola: ${nombre} has solicitado reestablecer tu password</p>
    <p>Sigue el siguiente enlace para generar un nuevo password:

    <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer password</a>

    <p>Si tu no solicitaste este e-mail puedes ignorar este mensaje.</p>
    `,
  });
};
