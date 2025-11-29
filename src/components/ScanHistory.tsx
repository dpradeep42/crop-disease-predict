import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClockClockwise, Warning, CheckCircle } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/use-auth'

interface ScanRecord {
  id: string
  image_data: string
  is_leaf: boolean
  confidence_score: number
  disease_detected: string | null
  disease_confidence: number | null
  severity: string | null
  analyzed_at: string
  created_at: string
}

export const ScanHistory = () => {
  const { user } = useAuth()
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchScans()
    }
  }, [user])

  const fetchScans = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/crop_scans?user_id=eq.${user.id}&order=created_at.desc&limit=10`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      )

      const data = await response.json()
      setScans(data || [])
    } catch (error) {
      console.error('Error fetching scans:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'high': return 'bg-destructive text-destructive-foreground'
      case 'medium': return 'bg-secondary text-secondary-foreground'
      case 'low': return 'bg-accent text-accent-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockClockwise size={24} weight="fill" />
            Scan History
          </CardTitle>
          <CardDescription>Loading your recent scans...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockClockwise size={24} weight="fill" />
          Scan History
        </CardTitle>
        <CardDescription>
          {scans.length > 0
            ? `Your recent crop disease scans (${scans.length})`
            : 'No scans yet'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No scan history available.</p>
            <p className="text-sm mt-1">Start scanning crops to see your history here.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex gap-4 p-3 rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="w-20 h-20 flex-shrink-0 bg-black rounded overflow-hidden">
                    <img
                      src={scan.image_data}
                      alt="Scan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {scan.disease_detected ? (
                          <Warning className="text-destructive flex-shrink-0" size={18} weight="fill" />
                        ) : (
                          <CheckCircle className="text-accent flex-shrink-0" size={18} weight="fill" />
                        )}
                        <span className="font-semibold text-sm">
                          {scan.disease_detected || 'No Disease Detected'}
                        </span>
                      </div>
                      {scan.severity && (
                        <Badge className={getSeverityColor(scan.severity)} variant="outline">
                          {scan.severity}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <span>Leaf: {scan.is_leaf ? 'Yes' : 'No'}</span>
                        <span>•</span>
                        <span>Confidence: {Math.round((scan.confidence_score || 0) * 100)}%</span>
                      </div>
                      <div>{formatDate(scan.analyzed_at || scan.created_at)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
