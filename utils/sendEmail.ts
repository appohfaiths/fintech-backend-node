import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { sendEmailType, sendEmailResponse} from "../types/utils";

const emailPassword = process.env.EMAIL_PASSWORD;
const supportEmail = process.env.SUPPORT_EMAIL;

const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
        user: supportEmail,
        pass: emailPassword
    }
})

export async function sendEmail({ subject, toEmail, data, template}: sendEmailType): Promise<sendEmailResponse> {
    const templatePath = fs.readFileSync(path.join(__dirname, '../templates', template), 'utf-8');
    const htmlTemplate = Handlebars.compile(templatePath);
    const htmlToSend = htmlTemplate(data);

    const emailOptions = {
        from: supportEmail,
        to: toEmail,
        subject: subject,
        html: htmlToSend
    }

    try {
        const response = await transporter.sendMail(emailOptions);
        return {
            code: 200,
            message: "Email sent successfully"
        }
    } catch (error) {
        if(error instanceof Error) {
            return {
                code: 500,
                message: error.message
            }
        } else {
            return {
                code: 400,
                message: "An unknown error occurred"
            }
        }
    }
}