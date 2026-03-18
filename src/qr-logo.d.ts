declare module "qr-logo" {
  export default class QRLogo {
    constructor(iconUrl: string);
    generate(
      data: string,
      options: { errorCorrectionLevel: string; margin: number; width: number },
      version: number,
    ): Promise<string>;
  }
}
