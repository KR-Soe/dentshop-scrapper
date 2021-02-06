const { promisify } = require('util');
const nodemailer = require('nodemailer');
const config = require('../config');


class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.mailer.emit.user,
        pass: config.mailer.emit.pass
      }
    });
    this.send = promisify(this.transporter.sendMail).bind(this.transporter);
  }

  async sendEmail(products) {
    const content = products.reduce((i, row) => {
      return `${i}<tr><td>${row.title}</td></tr>`;
    }, '');

    const mailOptions = {
      from: config.mailer.emit.user,
      to: config.mailer.to.user,
      subject: 'Sincronizacion de productos',
      html: `
      <div>
        <h1>La sincronizacion de productos ha finalizado exitosamente!</h1>
        <table><thead><tr><th>Productos agregados</th></tr></thead><tbody> ${content} </tbody></table>
      </div>`
    };

    try {
      await this.send(mailOptions);
    } catch (err) {
      console.error('email no se pudo enviar existosamente por esto', err);
    }
  }
}


module.exports = EmailService;
