export type sendEmailType = {
    subject: string;
    toEmail: string;
    data: object;
    template: string;
}

export type sendEmailResponse = {
    message: string;
    code: number;
}
