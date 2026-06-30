import Compressor from 'compressorjs'

export function compressImage(file: File, quality = 0.6, maxWidth = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality,
      maxWidth,
      maxHeight: maxWidth,
      mimeType: 'image/jpeg',
      success(blob) {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      },
      error: reject,
    })
  })
}
