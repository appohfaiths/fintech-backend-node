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

export type ApiResponse = {
    message: string;
    code: number;
    data?: object;
}