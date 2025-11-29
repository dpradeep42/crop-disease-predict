import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  imageData: string;
}

interface LeafDetectionResult {
  isLeaf: boolean;
  confidence: number;
  reason: string;
}

interface DiseaseDetectionResult {
  diseaseDetected: string | null;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | null;
  symptoms: string[];
  affectedArea: number;
}

interface AnalysisResult {
  leafDetection: LeafDetectionResult;
  diseaseDetection: DiseaseDetectionResult | null;
}

function analyzeImageData(imageData: string): AnalysisResult {
  try {
    const base64Data = imageData.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const sampleSize = Math.min(binaryData.length, 100000);
    const step = Math.floor(binaryData.length / sampleSize);
    
    let greenPixels = 0;
    let brownPixels = 0;
    let yellowPixels = 0;
    let darkSpots = 0;
    let whiteSpots = 0;
    let totalPixels = 0;
    let brightnessSum = 0;
    
    for (let i = 0; i < binaryData.length - 2; i += step * 3) {
      const r = binaryData[i];
      const g = binaryData[i + 1];
      const b = binaryData[i + 2];
      
      if (r === undefined || g === undefined || b === undefined) continue;
      
      const brightness = (r + g + b) / 3;
      brightnessSum += brightness;
      
      if (g > r && g > b && g > 60) {
        greenPixels++;
      }
      
      if (r > 80 && r < 180 && g > 50 && g < 140 && b < 80 && Math.abs(r - g) < 50) {
        brownPixels++;
      }
      
      if (r > 200 && g > 180 && b < 100) {
        yellowPixels++;
      }
      
      if (r < 80 && g < 80 && b < 80) {
        darkSpots++;
      }
      
      if (r > 220 && g > 220 && b > 220) {
        whiteSpots++;
      }
      
      totalPixels++;
    }
    
    const greenRatio = (greenPixels / totalPixels);
    const brownRatio = (brownPixels / totalPixels);
    const yellowRatio = (yellowPixels / totalPixels);
    const darkRatio = (darkSpots / totalPixels);
    const whiteRatio = (whiteSpots / totalPixels);
    const avgBrightness = brightnessSum / totalPixels;
    
    const leafColorRatio = greenRatio + brownRatio;
    const hasLeafTexture = avgBrightness > 30 && avgBrightness < 220;
    
    let isLeaf = false;
    let leafConfidence = 0;
    let reason = '';
    
    if (leafColorRatio > 0.25 && hasLeafTexture && greenRatio > 0.1) {
      isLeaf = true;
      leafConfidence = Math.min(0.95, 0.65 + (leafColorRatio * 0.4));
      reason = 'Image shows strong leaf characteristics with appropriate color distribution and texture';
    } else if (leafColorRatio > 0.15 && greenRatio > 0.05) {
      isLeaf = true;
      leafConfidence = Math.min(0.75, 0.45 + (leafColorRatio * 0.35));
      reason = 'Image partially matches leaf characteristics';
    } else if (greenRatio > 0.08) {
      isLeaf = false;
      leafConfidence = 0.35;
      reason = 'Some plant material detected but insufficient leaf characteristics';
    } else {
      isLeaf = false;
      leafConfidence = 0.15;
      reason = 'Image does not appear to be a leaf. Please upload a clear photo of a crop leaf.';
    }
    
    const leafDetection: LeafDetectionResult = {
      isLeaf,
      confidence: leafConfidence,
      reason
    };
    
    if (!isLeaf || leafConfidence < 0.4) {
      return {
        leafDetection,
        diseaseDetection: null
      };
    }
    
    const diseases = [
      {
        name: 'Leaf Blight',
        score: (brownRatio * 1.2) + (darkRatio * 0.8) + (yellowRatio * 0.3),
        symptoms: ['Brown spots on leaves', 'Wilting', 'Yellowing']
      },
      {
        name: 'Rust Disease',
        score: (brownRatio * 0.9) + (yellowRatio * 1.1) + (darkRatio * 0.2),
        symptoms: ['Orange-red pustules', 'Premature leaf drop']
      },
      {
        name: 'Bacterial Leaf Spot',
        score: (darkRatio * 1.3) + (yellowRatio * 0.5) + (brownRatio * 0.3),
        symptoms: ['Dark water-soaked spots', 'Yellowing']
      },
      {
        name: 'Powdery Mildew',
        score: (whiteRatio * 1.5) + (greenRatio * 0.2),
        symptoms: ['White powdery coating on leaves']
      },
      {
        name: 'Late Blight',
        score: (darkRatio * 1.1) + (brownRatio * 0.7) + (whiteRatio * 0.3),
        symptoms: ['Dark brown spots', 'White mold underneath']
      }
    ];
    
    diseases.sort((a, b) => b.score - a.score);
    const topDisease = diseases[0];
    
    const totalAffected = brownRatio + yellowRatio + darkRatio + whiteRatio;
    
    let diseaseDetection: DiseaseDetectionResult;
    
    if (topDisease.score > 0.12 && totalAffected > 0.08) {
      const confidence = Math.min(0.93, 0.55 + (topDisease.score * 1.2));
      const severity: 'low' | 'medium' | 'high' = 
        totalAffected > 0.25 ? 'high' : 
        totalAffected > 0.14 ? 'medium' : 'low';
      
      diseaseDetection = {
        diseaseDetected: topDisease.name,
        confidence,
        severity,
        symptoms: topDisease.symptoms,
        affectedArea: Math.min(95, Math.round(totalAffected * 100))
      };
    } else {
      diseaseDetection = {
        diseaseDetected: null,
        confidence: 0,
        severity: null,
        symptoms: [],
        affectedArea: 0
      };
    }
    
    return {
      leafDetection,
      diseaseDetection
    };
    
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze image');
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageData }: AnalysisRequest = await req.json();

    if (!imageData || !imageData.startsWith('data:image')) {
      return new Response(
        JSON.stringify({ error: 'Invalid image data' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const result = analyzeImageData(imageData);

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});