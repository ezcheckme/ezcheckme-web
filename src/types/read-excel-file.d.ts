declare module "read-excel-file/web" {
  const readXlsxFile: <T = any>(file: File | Blob) => Promise<T[]>;
  export default readXlsxFile;
}
