import JSZip from 'jszip';

export interface FileToZip {
  name: string;
  blob: Blob;
}

export const downloadAsZip = async (files: FileToZip[], zipName: string = 'compressed-files.zip') => {
  const zip = new JSZip();

  // Add all files to zip
  files.forEach((file) => {
    zip.file(file.name, file.blob);
  });

  // Generate zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Download
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
