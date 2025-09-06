// シングルトンインスタンスとしてTextEncoderとTextDecoderを作成
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

// チャンクサイズを最適化（64KB）
const CHUNK_SIZE = 64 * 1024

// メモリ効率を改善したストリーム作成関数
const createUpstream = (value: Uint8Array) => {
  let offset = 0
  return new ReadableStream({
    pull(controller) {
      if (offset >= value.length) {
        controller.close()
        return
      }

      const chunk = value.slice(offset, offset + CHUNK_SIZE)
      offset += chunk.length
      controller.enqueue(chunk)
    },
  })
}

// 圧縮処理の最適化
async function compressToBase64(input: string): Promise<string> {
  const data = textEncoder.encode(input)
  const upstream = createUpstream(data)
  const compression = new CompressionStream("deflate")
  const stream = upstream.pipeThrough(compression)

  const chunks: Uint8Array[] = []
  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const compressed = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  )
  let offset = 0
  for (const chunk of chunks) {
    compressed.set(chunk, offset)
    offset += chunk.length
  }

  return btoa(String.fromCharCode.apply(null, Array.from(compressed)))
}

// 解凍処理の最適化
async function decompressFromBase64(input: string): Promise<string> {
  const compressedBytes = Uint8Array.from(atob(input), (c) => c.charCodeAt(0))
  const upstream = createUpstream(compressedBytes)
  const decompression = new DecompressionStream("deflate")
  const stream = upstream.pipeThrough(decompression)

  const chunks: Uint8Array[] = []
  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const decompressed = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  )
  let offset = 0
  for (const chunk of chunks) {
    decompressed.set(chunk, offset)
    offset += chunk.length
  }

  return textDecoder.decode(decompressed)
}

// URL安全な文字列に変換する関数
export async function compressToEncodedURIComponent(
  input: string
): Promise<string> {
  if (!input) return ""
  const withBase64 = await compressToBase64(input)
  return withBase64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

// URL安全な文字列から元のテキストに戻す関数
export async function decompressFromEncodedURIComponent(
  input: string
): Promise<string> {
  if (!input) return ""
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  while (base64.length % 4) {
    base64 += "="
  }
  return decompressFromBase64(base64)
}
