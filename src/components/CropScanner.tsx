import React, { useRef, useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, Upload, X, ArrowClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { AnalysisResult } from '@/lib/disease-detection'
import { DiseaseResults } from './DiseaseResults'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'

interface CropScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanComplete?: () => void
}

export const CropScanner = ({ open, onOpenChange, onScanComplete }: CropScannerProps) => {
  const { user, supabaseUser } = useAuth()
  const [mode, setMode] = useState<'select' | 'camera' | 'upload'>('select')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showResults, setShowResults] = useState(false)
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
      setAnalysisResult(null)
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
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
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
    setAnalysisResult(null)
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
        setMode('upload')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!capturedImage) return

    setAnalyzing(true)
    const toastId = toast.loading('Analyzing image with AI...')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Please log in to analyze images', { id: toastId })
        return
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-crop-disease`

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: capturedImage })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const result: AnalysisResult = await response.json()
      setAnalysisResult(result)

      if (supabaseUser) {
        await saveScanToDatabase(result)
      }

      toast.success('Analysis complete!', { id: toastId })
      onOpenChange(false)
      setShowResults(true)

      if (onScanComplete) {
        onScanComplete()
      }
    } catch (error: any) {
      console.error('Analysis error:', error)
      toast.error(error.message || 'Failed to analyze image. Please try again.', { id: toastId })
    } finally {
      setAnalyzing(false)
    }
  }

  const saveScanToDatabase = async (result: AnalysisResult) => {
    if (!supabaseUser || !capturedImage) return

    try {
      const { error } = await supabase
        .from('crop_scans')
        .insert({
          user_id: supabaseUser.id,
          image_data: capturedImage,
          is_leaf: result.leafDetection.isLeaf,
          confidence_score: result.leafDetection.confidence,
          disease_detected: result.diseaseDetection?.diseaseDetected,
          disease_confidence: result.diseaseDetection?.confidence,
          severity: result.diseaseDetection?.severity,
          analyzed_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving scan:', error)
      }
    } catch (error) {
      console.error('Error saving scan:', error)
    }
  }

  const handleReset = () => {
    setCapturedImage(null)
    setAnalysisResult(null)
    setMode('select')
  }

  const handleResultsClose = () => {
    setShowResults(false)
    setCapturedImage(null)
    setAnalysisResult(null)
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
            <p className="text-sm text-muted-foreground">Use your camera to capture crop leaf</p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:border-primary transition-colors"
        onClick={() => {
          fileInputRef.current?.click()
        }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
            <Upload className="text-secondary" size={32} weight="fill" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Upload Image</h3>
            <p className="text-sm text-muted-foreground">Select a leaf image from your device</p>
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
            <Button variant="outline" onClick={retakePhoto} className="flex-1" disabled={analyzing}>
              <ArrowClockwise size={18} />
              Retake
            </Button>
            <Button onClick={handleAnalyze} className="flex-1" disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze Image'}
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
              onClick={handleReset}
              className="flex-1"
              disabled={analyzing}
            >
              <X size={18} />
              Cancel
            </Button>
            <Button onClick={handleAnalyze} className="flex-1" disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze Image'}
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
              {mode === 'select' && 'Choose how you want to capture the crop leaf'}
              {mode === 'camera' && 'Position your camera to capture the crop leaf clearly'}
              {mode === 'upload' && 'Review your selected image'}
            </DialogDescription>
          </DialogHeader>
          {mode === 'select' && renderSelectMode()}
          {mode === 'camera' && renderCameraMode()}
          {mode === 'upload' && renderUploadMode()}
        </DialogContent>
      </Dialog>

      <DiseaseResults
        open={showResults}
        onOpenChange={handleResultsClose}
        analysisResult={analysisResult}
        imageData={capturedImage}
      />
    </>
  )
}
