declare module "read-excel-file/browser" {
  const readXlsxFile: <T = any>(file: File | Blob) => Promise<T[]>;
  export default readXlsxFile;
}
