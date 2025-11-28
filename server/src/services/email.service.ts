import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use host/port from env
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export class EmailService {
    static async sendVerificationEmail(to: string, code: string) {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to,
            subject: 'URL Kısaltıcı - E-posta Doğrulama',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Hoş Geldiniz!</h2>
          <p>Hesabınızı doğrulamak için lütfen aşağıdaki kodu kullanın:</p>
          <h1 style="color: #4f46e5; letter-spacing: 5px;">${code}</h1>
          <p>Bu kodu kimseyle paylaşmayın.</p>
        </div>
      `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Verification email sent to ${to}`);
        } catch (error) {
            console.error('Error sending email:', error);
            // Don't throw error to avoid blocking registration in dev mode if SMTP is not set
        }
    }

    static async sendDeletionConfirmation(to: string, code: string) {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to,
            subject: 'URL Kısaltıcı - Hesap Silme Onayı',
            html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #ef4444;">Hesap Silme Talebi</h2>
            <p>Hesabınızı ve tüm linklerinizi silmek üzeresiniz. Bu işlem geri alınamaz.</p>
            <p>Devam etmek için aşağıdaki kodu kullanın:</p>
            <h1 style="color: #ef4444; letter-spacing: 5px;">${code}</h1>
          </div>
        `,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

    static async sendErrorLog(error: any, context: string = 'General Error') {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: 'muhammedpyz466@gmail.com',
            subject: `🚨 CRITICAL ERROR: ${context}`,
            html: `
                <h2>Server Error Report</h2>
                <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                <p><strong>Context:</strong> ${context}</p>
                <p><strong>Error Message:</strong> ${error.message}</p>
                <h3>Stack Trace:</h3>
                <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${error.stack}</pre>
                <h3>Full Error Object:</h3>
                <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}</pre>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Error log sent to email.');
        } catch (emailError) {
            console.error('Failed to send error log email:', emailError);
        }
    }
}
