import JSZip from 'jszip'

export async function makeZip(files) {
  const zip = new JSZip()
  for (const file of files) {
    zip.file(file.name, file.data)
  }
  return zip.generateAsync({ type: 'blob', compression: 'STORE' })
}