export interface LeafDetectionResult {
  isLeaf: boolean
  confidence: number
  reason: string
}

export interface DiseaseDetectionResult {
  diseaseDetected: string | null
  confidence: number
  severity: 'low' | 'medium' | 'high' | null
  symptoms: string[]
  affectedArea: number
}

export interface AnalysisResult {
  leafDetection: LeafDetectionResult
  diseaseDetection: DiseaseDetectionResult | null
}

export const analyzeLeafImage = async (imageData: string): Promise<LeafDetectionResult> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve({ isLeaf: false, confidence: 0, reason: 'Failed to process image' })
        return
      }

      ctx.drawImage(img, 0, 0)
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageDataObj.data

      let greenPixels = 0
      let brownPixels = 0
      let totalPixels = 0
      let brightnessSum = 0

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        const brightness = (r + g + b) / 3
        brightnessSum += brightness

        if (g > r && g > b && g > 60) {
          greenPixels++
        }

        if (r > 80 && g > 50 && b < 80 && Math.abs(r - g) < 50) {
          brownPixels++
        }

        totalPixels++
      }

      const greenRatio = (greenPixels / totalPixels) * 4
      const brownRatio = (brownPixels / totalPixels) * 4
      const avgBrightness = brightnessSum / totalPixels

      const leafColorRatio = greenRatio + brownRatio
      const hasLeafTexture = avgBrightness > 50 && avgBrightness < 200

      let isLeaf = false
      let confidence = 0
      let reason = ''

      if (leafColorRatio > 0.3 && hasLeafTexture) {
        isLeaf = true
        confidence = Math.min(0.95, 0.6 + (leafColorRatio * 0.5))
        reason = 'Image shows leaf-like characteristics with appropriate color distribution'
      } else if (leafColorRatio > 0.15) {
        isLeaf = true
        confidence = Math.min(0.75, 0.4 + (leafColorRatio * 0.4))
        reason = 'Image partially matches leaf characteristics'
      } else if (greenRatio > 0.1) {
        isLeaf = false
        confidence = 0.3
        reason = 'Some green detected but insufficient leaf characteristics'
      } else {
        isLeaf = false
        confidence = 0.1
        reason = 'Image does not appear to be a leaf'
      }

      resolve({ isLeaf, confidence, reason })
    }

    img.onerror = () => {
      resolve({ isLeaf: false, confidence: 0, reason: 'Failed to load image' })
    }

    img.src = imageData
  })
}

export const detectDisease = async (imageData: string): Promise<DiseaseDetectionResult> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve({
          diseaseDetected: null,
          confidence: 0,
          severity: null,
          symptoms: [],
          affectedArea: 0
        })
        return
      }

      ctx.drawImage(img, 0, 0)
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageDataObj.data

      let brownSpots = 0
      let yellowPixels = 0
      let darkSpots = 0
      let whiteSpots = 0
      let totalPixels = 0

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        if (r > 100 && r < 180 && g > 60 && g < 140 && b < 80) {
          brownSpots++
        }

        if (r > 200 && g > 180 && b < 100) {
          yellowPixels++
        }

        if (r < 80 && g < 80 && b < 80) {
          darkSpots++
        }

        if (r > 220 && g > 220 && b > 220) {
          whiteSpots++
        }

        totalPixels++
      }

      const brownRatio = (brownSpots / totalPixels) * 4
      const yellowRatio = (yellowPixels / totalPixels) * 4
      const darkRatio = (darkSpots / totalPixels) * 4
      const whiteRatio = (whiteSpots / totalPixels) * 4

      const diseases = [
        {
          name: 'Leaf Blight',
          confidence: brownRatio * 0.6 + darkRatio * 0.4,
          symptoms: ['Brown spots on leaves', 'Wilting', 'Yellowing'],
          indicators: brownRatio + darkRatio
        },
        {
          name: 'Rust Disease',
          confidence: brownRatio * 0.5 + yellowRatio * 0.5,
          symptoms: ['Orange-red pustules', 'Premature leaf drop'],
          indicators: brownRatio * 0.8 + yellowRatio * 0.6
        },
        {
          name: 'Bacterial Leaf Spot',
          confidence: darkRatio * 0.7 + yellowRatio * 0.3,
          symptoms: ['Dark water-soaked spots', 'Yellowing'],
          indicators: darkRatio + yellowRatio * 0.5
        },
        {
          name: 'Powdery Mildew',
          confidence: whiteRatio * 0.8,
          symptoms: ['White powdery coating on leaves'],
          indicators: whiteRatio
        },
        {
          name: 'Late Blight',
          confidence: darkRatio * 0.6 + brownRatio * 0.4,
          symptoms: ['Dark brown spots', 'White mold underneath'],
          indicators: darkRatio * 0.8 + brownRatio * 0.5
        }
      ]

      diseases.sort((a, b) => b.indicators - a.indicators)
      const topDisease = diseases[0]

      const totalAffected = brownRatio + yellowRatio + darkRatio + whiteRatio

      if (topDisease.indicators > 0.15) {
        const confidence = Math.min(0.92, 0.5 + (topDisease.indicators * 0.8))
        const severity = totalAffected > 0.3 ? 'high' : totalAffected > 0.15 ? 'medium' : 'low'

        resolve({
          diseaseDetected: topDisease.name,
          confidence,
          severity,
          symptoms: topDisease.symptoms,
          affectedArea: Math.round(totalAffected * 100)
        })
      } else {
        resolve({
          diseaseDetected: null,
          confidence: 0,
          severity: null,
          symptoms: [],
          affectedArea: 0
        })
      }
    }

    img.onerror = () => {
      resolve({
        diseaseDetected: null,
        confidence: 0,
        severity: null,
        symptoms: [],
        affectedArea: 0
      })
    }

    img.src = imageData
  })
}

export const analyzeImage = async (imageData: string): Promise<AnalysisResult> => {
  const leafDetection = await analyzeLeafImage(imageData)

  if (!leafDetection.isLeaf || leafDetection.confidence < 0.5) {
    return {
      leafDetection,
      diseaseDetection: null
    }
  }

  const diseaseDetection = await detectDisease(imageData)

  return {
    leafDetection,
    diseaseDetection
  }
}
