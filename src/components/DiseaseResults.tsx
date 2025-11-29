import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Warning, X, FirstAid, Leaf, Bug } from '@phosphor-icons/react'
import { AnalysisResult } from '@/lib/disease-detection'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'

interface DiseaseResultsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysisResult: AnalysisResult | null
  imageData: string | null
}

interface Remedy {
  id: string
  treatment_name: string
  description: string
  type: string
  effectiveness: string
  application_timing: string
  precautions: string
}

interface Disease {
  id: string
  name: string
  symptoms: string
  causes: string
  prevention: string
  crop_types: string[]
}

export const DiseaseResults = ({ open, onOpenChange, analysisResult, imageData }: DiseaseResultsProps) => {
  const [remedies, setRemedies] = useState<Remedy[]>([])
  const [diseaseInfo, setDiseaseInfo] = useState<Disease | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && analysisResult?.diseaseDetection?.diseaseDetected) {
      fetchDiseaseData(analysisResult.diseaseDetection.diseaseDetected)
    }
  }, [open, analysisResult])

  const fetchDiseaseData = async (diseaseName: string) => {
    setLoading(true)
    try {
      const { data: diseases, error: diseaseError } = await supabase
        .from('diseases')
        .select('*')
        .eq('name', diseaseName)
        .limit(1)

      if (diseaseError) {
        console.error('Error fetching disease:', diseaseError)
      } else if (diseases && diseases.length > 0) {
        setDiseaseInfo(diseases[0])

        const { data: remediesData, error: remediesError } = await supabase
          .from('remedies')
          .select('*')
          .eq('disease_id', diseases[0].id)

        if (remediesError) {
          console.error('Error fetching remedies:', remediesError)
        } else {
          setRemedies(remediesData || [])
        }
      }
    } catch (error) {
      console.error('Error fetching disease data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!analysisResult) return null

  const { leafDetection, diseaseDetection } = analysisResult

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'high': return 'bg-destructive text-destructive-foreground'
      case 'medium': return 'bg-secondary text-secondary-foreground'
      case 'low': return 'bg-accent text-accent-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'high': return 'bg-accent text-accent-foreground'
      case 'medium': return 'bg-secondary text-secondary-foreground'
      case 'low': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'organic': return '🌿'
      case 'chemical': return '⚗️'
      case 'biological': return '🦠'
      case 'cultural': return '🌾'
      default: return '💊'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug size={24} weight="fill" className="text-primary" />
            Analysis Results
          </DialogTitle>
          <DialogDescription>
            Detailed crop disease analysis and treatment recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {imageData && (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <img src={imageData} alt="Analyzed crop" className="w-full h-full object-contain" />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf size={20} weight="fill" />
                Leaf Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Is this a leaf?</span>
                <div className="flex items-center gap-2">
                  {leafDetection.isLeaf ? (
                    <CheckCircle className="text-accent" size={20} weight="fill" />
                  ) : (
                    <X className="text-destructive" size={20} weight="fill" />
                  )}
                  <span className="font-semibold">
                    {leafDetection.isLeaf ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence</span>
                <Badge variant="outline">
                  {Math.round(leafDetection.confidence * 100)}%
                </Badge>
              </div>
              <Alert>
                <AlertDescription>{leafDetection.reason}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {!leafDetection.isLeaf || leafDetection.confidence < 0.5 ? (
            <Alert variant="destructive">
              <Warning className="h-4 w-4" weight="fill" />
              <AlertDescription>
                The uploaded image does not appear to be a leaf. Please upload a clear image of a crop leaf for disease detection.
              </AlertDescription>
            </Alert>
          ) : diseaseDetection?.diseaseDetected ? (
            <>
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Warning size={24} weight="fill" />
                    Disease Detected
                  </CardTitle>
                  <CardDescription>We found signs of disease in your crop</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Disease Name</span>
                      <span className="font-semibold text-lg">{diseaseDetection.diseaseDetected}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Detection Confidence</span>
                      <Badge variant="outline">
                        {Math.round(diseaseDetection.confidence * 100)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Severity Level</span>
                      <Badge className={getSeverityColor(diseaseDetection.severity)}>
                        {diseaseDetection.severity?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Affected Area</span>
                      <span className="font-semibold">{diseaseDetection.affectedArea}%</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Detected Symptoms</h4>
                    <ul className="space-y-1">
                      {diseaseDetection.symptoms.map((symptom, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {diseaseInfo && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold mb-1">Causes</h4>
                          <p className="text-sm text-muted-foreground">{diseaseInfo.causes}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Prevention Tips</h4>
                          <p className="text-sm text-muted-foreground">{diseaseInfo.prevention}</p>
                        </div>
                        {diseaseInfo.crop_types.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Commonly Affects</h4>
                            <div className="flex flex-wrap gap-2">
                              {diseaseInfo.crop_types.map((crop, idx) => (
                                <Badge key={idx} variant="outline">{crop}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {remedies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FirstAid size={24} weight="fill" className="text-primary" />
                      Treatment Recommendations
                    </CardTitle>
                    <CardDescription>
                      Expert remedies to treat {diseaseDetection.diseaseDetected}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue={remedies[0]?.id} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        {remedies.slice(0, 3).map((remedy, idx) => (
                          <TabsTrigger key={remedy.id} value={remedy.id}>
                            {getTypeIcon(remedy.type)} Option {idx + 1}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {remedies.map((remedy) => (
                        <TabsContent key={remedy.id} value={remedy.id} className="space-y-4 mt-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold">{remedy.treatment_name}</h3>
                              <Badge className={getEffectivenessColor(remedy.effectiveness)}>
                                {remedy.effectiveness} effectiveness
                              </Badge>
                            </div>
                            <Badge variant="outline" className="mb-3">
                              {remedy.type.charAt(0).toUpperCase() + remedy.type.slice(1)} Treatment
                            </Badge>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">{remedy.description}</p>
                          </div>

                          {remedy.application_timing && (
                            <div>
                              <h4 className="font-semibold mb-1">Application Timing</h4>
                              <p className="text-sm text-muted-foreground">{remedy.application_timing}</p>
                            </div>
                          )}

                          {remedy.precautions && (
                            <Alert>
                              <Warning className="h-4 w-4" weight="fill" />
                              <AlertDescription>
                                <strong>Precautions:</strong> {remedy.precautions}
                              </AlertDescription>
                            </Alert>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <CheckCircle className="mx-auto text-accent" size={48} weight="fill" />
                  <div>
                    <h3 className="text-lg font-semibold mb-1">No Disease Detected</h3>
                    <p className="text-sm text-muted-foreground">
                      Your crop appears healthy! Continue regular monitoring and maintain good agricultural practices.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
            {diseaseDetection?.diseaseDetected && (
              <Button className="flex-1">
                Save to History
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
