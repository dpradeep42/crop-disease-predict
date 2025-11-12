import React, { useRef, useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, Upload, X, ArrowClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CropScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CropScanner = ({ open, onOpenChange }: CropScannerProps) => {
  const [mode, setMode] = useState<'select' | 'camera' | 'upload'>('select')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode === 'camera' && !stream) {
      startCamera()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [mode])

  useEffect(() => {
    if (!open) {
      setMode('select')
      setCapturedImage(null)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
    }
  }, [open])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      toast.error('Failed to access camera. Please check permissions.')
      setMode('select')
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg')
        setCapturedImage(imageData)
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
          setStream(null)
        }
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = () => {
    if (capturedImage) {
      toast.success('Analyzing crop image...')
      onOpenChange(false)
    }
  }

  const renderSelectMode = () => (
    <div className="space-y-4 py-6">
      <Card
        className="p-6 cursor-pointer hover:border-primary transition-colors"
        onClick={() => setMode('camera')}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="text-primary" size={32} weight="fill" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Take Photo</h3>
            <p className="text-sm text-muted-foreground">Use your camera to capture crop image</p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:border-primary transition-colors"
        onClick={() => {
          setMode('upload')
          fileInputRef.current?.click()
        }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
            <Upload className="text-secondary" size={32} weight="fill" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Upload Image</h3>
            <p className="text-sm text-muted-foreground">Select an image from your device</p>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderCameraMode = () => (
    <div className="space-y-4">
      {!capturedImage ? (
        <>
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setMode('select')} className="flex-1">
              <X size={18} />
              Cancel
            </Button>
            <Button onClick={capturePhoto} className="flex-1">
              <Camera size={18} />
              Capture
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <img src={capturedImage} alt="Captured crop" className="w-full h-full object-contain" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={retakePhoto} className="flex-1">
              <ArrowClockwise size={18} />
              Retake
            </Button>
            <Button onClick={handleAnalyze} className="flex-1">
              Analyze Image
            </Button>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )

  const renderUploadMode = () => (
    <div className="space-y-4">
      {!capturedImage ? (
        <div className="py-6">
          <p className="text-center text-muted-foreground">Selecting image...</p>
        </div>
      ) : (
        <>
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <img src={capturedImage} alt="Uploaded crop" className="w-full h-full object-contain" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCapturedImage(null)
                setMode('select')
              }}
              className="flex-1"
            >
              <X size={18} />
              Cancel
            </Button>
            <Button onClick={handleAnalyze} className="flex-1">
              Analyze Image
            </Button>
          </div>
        </>
      )}
    </div>
  )

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scan Crop Image</DialogTitle>
            <DialogDescription>
              {mode === 'select' && 'Choose how you want to capture the crop image'}
              {mode === 'camera' && 'Position your camera to capture the crop'}
              {mode === 'upload' && 'Review your selected image'}
            </DialogDescription>
          </DialogHeader>
          {mode === 'select' && renderSelectMode()}
          {mode === 'camera' && renderCameraMode()}
          {mode === 'upload' && renderUploadMode()}
        </DialogContent>
      </Dialog>
    </>
  )
}
