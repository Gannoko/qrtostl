'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Cable as Cube } from 'lucide-react'
import { QR3DViewer } from '@/components/qr-3d-viewer'

export function QRToSTLGenerator() {
  const [inputType, setInputType] = useState<'text' | 'url'>('url')
  const [inputValue, setInputValue] = useState('')
  const [qrSize, setQrSize] = useState(50)
  const [qrHeight, setQrHeight] = useState(3)
  const [baseHeight, setBaseHeight] = useState(2)
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('L')
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [heightMap, setHeightMap] = useState<number[][] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d')

  const generateQR = async () => {
    if (!inputValue.trim()) {
      setError('Por favor ingresa un texto o URL')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      // Importar qrcode dinámicamente
      const QRCode = (await import('qrcode')).default

      // Generar QR como data URL
      const qrDataUrl = await QRCode.toDataURL(inputValue, {
        width: 256,
        margin: 1,
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      setQrPreview(qrDataUrl)

      // Generar height map para el visor 3D
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = qrDataUrl

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No se pudo crear el contexto del canvas')

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Convertir imagen a matriz de altura
      const resolution = canvas.width
      const newHeightMap: number[][] = []

      for (let y = 0; y < resolution; y++) {
        newHeightMap[y] = []
        for (let x = 0; x < resolution; x++) {
          const idx = (y * resolution + x) * 4
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          // Negro = altura máxima, Blanco = altura mínima
          newHeightMap[y][x] = brightness < 128 ? qrHeight : 0
        }
      }

      setHeightMap(newHeightMap)
    } catch (err) {
      setError('Error al generar el código QR')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSTL = async () => {
    if (!qrPreview) {
      setError('Primero genera el código QR')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Cargar la imagen del QR
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = qrPreview

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // Crear canvas para procesar la imagen
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No se pudo crear el contexto del canvas')

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Convertir imagen a matriz de altura
      const resolution = canvas.width
      const heightMap: number[][] = []

      for (let y = 0; y < resolution; y++) {
        heightMap[y] = []
        for (let x = 0; x < resolution; x++) {
          const idx = (y * resolution + x) * 4
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          // Negro = altura máxima, Blanco = altura mínima
          heightMap[y][x] = brightness < 128 ? qrHeight : 0
        }
      }

      // Generar STL
      const stl = generateSTLFromHeightMap(heightMap, qrSize, baseHeight)

      // Descargar archivo
      const blob = new Blob([stl], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-code-${Date.now()}.stl`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Error al generar el archivo STL')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Cube className="h-4 w-4" />
          Impresión 3D
        </div>
        <h1 className="font-sans text-5xl font-bold tracking-tight text-foreground">
          Generador QR a STL
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
          {'Convierte textos o URLs en códigos QR 3D listos para imprimir. Visualiza en tiempo real y descarga tu archivo STL.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-sans">Configuración</CardTitle>
            <CardDescription>Ingresa tus datos y ajusta los parámetros</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid w-full grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setInputType('url')}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    inputType === 'url'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('text')}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    inputType === 'text'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Texto
                </button>
              </div>

              {inputType === 'url' ? (
                <div className="space-y-2">
                  <Label htmlFor="url-input">URL del código QR</Label>
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://ejemplo.com"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Alert className="border-blue-200 bg-blue-50/50">
                    <AlertDescription className="text-xs leading-relaxed">
                      <span className="font-semibold">Tip:</span> URLs más cortas generan QR más simples. Usa acortadores como bit.ly o tinyurl.com para mejor impresión 3D.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="text-input">Texto del código QR</Label>
                  <Input
                    id="text-input"
                    type="text"
                    placeholder="Tu texto aquí"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Alert className="border-blue-200 bg-blue-50/50">
                    <AlertDescription className="text-xs leading-relaxed">
                      <span className="font-semibold">Tip:</span> Textos más cortos (menos de 20 caracteres) generan QR más simples y fáciles de imprimir.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <Label className="text-sm font-semibold">Nivel de corrección de errores</Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {'Un nivel más bajo (L) genera QR más simples, ideales para impresión 3D'}
                </p>
                <div className="grid w-full grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setErrorCorrectionLevel('L')}
                    className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      errorCorrectionLevel === 'L'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    L
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorCorrectionLevel('M')}
                    className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      errorCorrectionLevel === 'M'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    M
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorCorrectionLevel('Q')}
                    className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      errorCorrectionLevel === 'Q'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    Q
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorCorrectionLevel('H')}
                    className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      errorCorrectionLevel === 'H'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    H
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`rounded p-2 ${errorCorrectionLevel === 'L' ? 'bg-primary/20 font-semibold' : 'bg-muted/50'}`}>
                    <div className="font-medium">L - Bajo (7%)</div>
                    <div className="text-muted-foreground">Más simple</div>
                  </div>
                  <div className={`rounded p-2 ${errorCorrectionLevel === 'M' ? 'bg-primary/20 font-semibold' : 'bg-muted/50'}`}>
                    <div className="font-medium">M - Medio (15%)</div>
                    <div className="text-muted-foreground">Balance</div>
                  </div>
                  <div className={`rounded p-2 ${errorCorrectionLevel === 'Q' ? 'bg-primary/20 font-semibold' : 'bg-muted/50'}`}>
                    <div className="font-medium">Q - Alto (25%)</div>
                    <div className="text-muted-foreground">Más robusto</div>
                  </div>
                  <div className={`rounded p-2 ${errorCorrectionLevel === 'H' ? 'bg-primary/20 font-semibold' : 'bg-muted/50'}`}>
                    <div className="font-medium">H - Muy alto (30%)</div>
                    <div className="text-muted-foreground">Máxima recuperación</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Tamaño del QR</Label>
                  <span className="text-sm text-muted-foreground">{qrSize}mm</span>
                </div>
                <Slider
                  value={[qrSize]}
                  onValueChange={(v) => setQrSize(v[0])}
                  min={20}
                  max={50}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Altura del QR</Label>
                  <span className="text-sm text-muted-foreground">{qrHeight}mm</span>
                </div>
                <Slider
                  value={[qrHeight]}
                  onValueChange={(v) => setQrHeight(v[0])}
                  min={1}
                  max={5}
                  step={0.5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Altura de la base</Label>
                  <span className="text-sm text-muted-foreground">{baseHeight}mm</span>
                </div>
                <Slider
                  value={[baseHeight]}
                  onValueChange={(v) => setBaseHeight(v[0])}
                  min={1}
                  max={5}
                  step={0.5}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={generateQR} disabled={isGenerating} className="flex-1">
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar QR
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-sans">Vista previa y descarga</CardTitle>
                <CardDescription>Previsualiza y descarga tu archivo STL</CardDescription>
              </div>
              {qrPreview && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('3d')}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === '3d'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    Vista 3D
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('2d')}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === '2d'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    Vista 2D
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {viewMode === '3d' ? (
              <div className="h-[500px] w-full">
                <QR3DViewer
                  heightMap={heightMap}
                  qrSize={qrSize}
                  qrHeight={qrHeight}
                  baseHeight={baseHeight}
                />
              </div>
            ) : (
              <div className="flex min-h-[500px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-gradient-to-br from-slate-50 to-slate-100/50 p-8">
                {qrPreview ? (
                  <div className="rounded-lg bg-white p-6 shadow-lg">
                    <img src={qrPreview || "/placeholder.svg"} alt="QR Preview" className="h-64 w-64" />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Cube className="mx-auto mb-3 h-12 w-12 opacity-20" />
                    <p className="text-sm font-medium">{'Sin vista previa'}</p>
                    <p className="text-xs">{'Genera un QR para ver la vista previa'}</p>
                  </div>
                )}
              </div>
            )}

            {qrPreview && (
              <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  Información del modelo
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-md bg-background/50 p-2 text-sm">
                    <span className="text-muted-foreground">Dimensiones:</span>
                    <span className="font-semibold">{qrSize} × {qrSize}mm</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-background/50 p-2 text-sm">
                    <span className="text-muted-foreground">Altura total:</span>
                    <span className="font-semibold">{qrHeight + baseHeight}mm</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-background/50 p-2 text-sm">
                    <span className="text-muted-foreground">Altura QR:</span>
                    <span className="font-semibold">{qrHeight}mm</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-background/50 p-2 text-sm">
                    <span className="text-muted-foreground">Altura base:</span>
                    <span className="font-semibold">{baseHeight}mm</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-center rounded-md bg-background/50 p-2 text-sm">
                  <span className="text-muted-foreground">Formato:</span>
                  <span className="ml-2 font-semibold text-primary">STL ASCII</span>
                </div>
              </div>
            )}

            <Button
              onClick={generateSTL}
              disabled={!qrPreview || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Descargar STL
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="font-sans">Especificaciones técnicas</CardTitle>
          <CardDescription>Información sobre las capacidades del generador</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2 rounded-lg bg-background/80 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-muted-foreground">Tamaño máximo</p>
            <p className="text-3xl font-bold text-primary">50mm</p>
            <p className="text-xs text-muted-foreground">Dimensiones del modelo</p>
          </div>
          <div className="space-y-2 rounded-lg bg-background/80 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-muted-foreground">Formato de salida</p>
            <p className="text-3xl font-bold text-primary">STL</p>
            <p className="text-xs text-muted-foreground">Listo para impresión</p>
          </div>
          <div className="space-y-2 rounded-lg bg-background/80 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-muted-foreground">Tipo de código</p>
            <p className="text-3xl font-bold text-primary">Estático</p>
            <p className="text-xs text-muted-foreground">Texto o URL fijo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function generateSTLFromHeightMap(
  heightMap: number[][],
  size: number,
  baseHeight: number
): string {
  const resolution = heightMap.length
  const scale = size / resolution
  const triangles: string[] = []

  // Función para agregar un triángulo
  const addTriangle = (p1: number[], p2: number[], p3: number[]) => {
    // Calcular normal
    const v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]]
    const v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]]
    const normal = [
      v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0],
    ]
    const len = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2)
    if (len > 0) {
      normal[0] /= len
      normal[1] /= len
      normal[2] /= len
    }

    triangles.push(
      `  facet normal ${normal[0].toExponential(6)} ${normal[1].toExponential(6)} ${normal[2].toExponential(6)}\n` +
        `    outer loop\n` +
        `      vertex ${p1[0].toExponential(6)} ${p1[1].toExponential(6)} ${p1[2].toExponential(6)}\n` +
        `      vertex ${p2[0].toExponential(6)} ${p2[1].toExponential(6)} ${p2[2].toExponential(6)}\n` +
        `      vertex ${p3[0].toExponential(6)} ${p3[1].toExponential(6)} ${p3[2].toExponential(6)}\n` +
        `    endloop\n` +
        `  endfacet\n`
    )
  }

  // Superficie superior (con el patrón del QR)
  for (let y = 0; y < resolution - 1; y++) {
    for (let x = 0; x < resolution - 1; x++) {
      const x1 = x * scale
      const x2 = (x + 1) * scale
      const y1 = y * scale
      const y2 = (y + 1) * scale

      const z1 = heightMap[y][x] + baseHeight
      const z2 = heightMap[y][x + 1] + baseHeight
      const z3 = heightMap[y + 1][x] + baseHeight
      const z4 = heightMap[y + 1][x + 1] + baseHeight

      addTriangle([x1, y1, z1], [x2, y1, z2], [x1, y2, z3])
      addTriangle([x2, y1, z2], [x2, y2, z4], [x1, y2, z3])
    }
  }

  // Base inferior
  addTriangle([0, 0, 0], [size, 0, 0], [0, size, 0])
  addTriangle([size, 0, 0], [size, size, 0], [0, size, 0])

  // Paredes laterales
  for (let x = 0; x < resolution - 1; x++) {
    const x1 = x * scale
    const x2 = (x + 1) * scale
    const z1 = heightMap[0][x] + baseHeight
    const z2 = heightMap[0][x + 1] + baseHeight
    addTriangle([x1, 0, 0], [x2, 0, 0], [x1, 0, z1])
    addTriangle([x2, 0, 0], [x2, 0, z2], [x1, 0, z1])
  }

  for (let x = 0; x < resolution - 1; x++) {
    const x1 = x * scale
    const x2 = (x + 1) * scale
    const z1 = heightMap[resolution - 1][x] + baseHeight
    const z2 = heightMap[resolution - 1][x + 1] + baseHeight
    addTriangle([x1, size, 0], [x1, size, z1], [x2, size, 0])
    addTriangle([x2, size, 0], [x1, size, z1], [x2, size, z2])
  }

  for (let y = 0; y < resolution - 1; y++) {
    const y1 = y * scale
    const y2 = (y + 1) * scale
    const z1 = heightMap[y][0] + baseHeight
    const z2 = heightMap[y + 1][0] + baseHeight
    addTriangle([0, y1, 0], [0, y1, z1], [0, y2, 0])
    addTriangle([0, y2, 0], [0, y1, z1], [0, y2, z2])
  }

  for (let y = 0; y < resolution - 1; y++) {
    const y1 = y * scale
    const y2 = (y + 1) * scale
    const z1 = heightMap[y][resolution - 1] + baseHeight
    const z2 = heightMap[y + 1][resolution - 1] + baseHeight
    addTriangle([size, y1, 0], [size, y2, 0], [size, y1, z1])
    addTriangle([size, y2, 0], [size, y2, z2], [size, y1, z1])
  }

  return `solid qr_code\n${triangles.join('')}endsolid qr_code\n`
}
