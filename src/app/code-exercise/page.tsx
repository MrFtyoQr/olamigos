"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Play, CheckCircle, XCircle, Code, RefreshCw } from "lucide-react"

interface CodeResponse {
  code: string
  explanation?: string
  language: string
}

export default function CodeExercisePage() {
  const [prompt, setPrompt] = useState("Función para calcular el factorial")
  const [language, setLanguage] = useState("Python")
  const [explanation, setExplanation] = useState(true)
  const [codeData, setCodeData] = useState<CodeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExerciseMode, setIsExerciseMode] = useState(false)
  const [userCode, setUserCode] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchCode = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `http://localhost:8000/api/generate-code?prompt=${encodeURIComponent(prompt)}&language=${encodeURIComponent(language)}&explanation=${explanation}`,
      )
      const data = await response.json()
      setCodeData(data)
      setUserCode("")
      setIsExerciseMode(false)
      setIsCorrect(null)
    } catch (error) {
      console.error("Error fetching code:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isExerciseMode && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isExerciseMode])

  const startExercise = () => {
    setIsExerciseMode(true)
    setUserCode("")
    setIsCorrect(null)
  }

  const checkCode = () => {
    if (!codeData) return

    // Extract only the code part (without comments/explanation)
    let codeToCheck = codeData.code
    if (explanation) {
      // Remove comments based on language
      if (language === "Python") {
        // Remove Python comments (both # and """)
        codeToCheck = codeToCheck
          .replace(/"""[\s\S]*?"""/g, "")
          .replace(/#.*$/gm, "")
          .trim()
      } else if (language === "JavaScript") {
        // Remove JS comments (both // and /* */)
        codeToCheck = codeToCheck
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\/\/.*$/gm, "")
          .trim()
      }
    }

    // Normalize whitespace for comparison
    const normalizedExpected = codeToCheck.replace(/\s+/g, " ").trim()
    const normalizedUser = userCode.replace(/\s+/g, " ").trim()

    setIsCorrect(normalizedExpected === normalizedUser)
  }

  const resetExercise = () => {
    setIsExerciseMode(false)
    setUserCode("")
    setIsCorrect(null)
  }

  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-2xl">Ejercicio de Código</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!isExerciseMode && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="prompt">Prompt</Label>
                <Input
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe el código que quieres generar"
                  className="mb-2"
                />
              </div>
              <div className="md:w-1/4">
                <Label htmlFor="language">Lenguaje</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Selecciona un lenguaje" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="JavaScript">JavaScript</SelectItem>
                    <SelectItem value="Java">Java</SelectItem>
                    <SelectItem value="C++">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-1/4 flex items-end">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="explanation"
                    checked={explanation}
                    onChange={(e) => setExplanation(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="explanation">Con explicación</Label>
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={fetchCode} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Code className="h-4 w-4 mr-2" />}
                  Generar
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : codeData ? (
            <div>
              {isExerciseMode ? (
                <div>
                  <div className="mb-4">
                    <Label htmlFor="userCode">Escribe el código de memoria:</Label>
                    <Textarea
                      ref={textareaRef}
                      id="userCode"
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      placeholder="Escribe el código aquí..."
                      className="font-mono h-64"
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={resetExercise}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reiniciar
                    </Button>
                    <Button onClick={checkCode} disabled={!userCode.trim()}>
                      Verificar
                    </Button>
                  </div>
                  {isCorrect !== null && (
                    <div
                      className={`mt-4 p-3 rounded-md ${isCorrect ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                    >
                      <div className="flex items-center">
                        {isCorrect ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                            <span className="font-medium text-green-600 dark:text-green-400">
                              ¡Correcto! Has escrito el código perfectamente.
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                            <span className="font-medium text-red-600 dark:text-red-400">
                              Incorrecto. Hay diferencias con el código original.
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm overflow-x-auto">{codeData.code}</pre>
                  </div>
                  {codeData.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                      <h3 className="font-bold mb-2">Explicación:</h3>
                      <p className="whitespace-pre-wrap">{codeData.explanation}</p>
                    </div>
                  )}
                  <div className="flex justify-center mt-4">
                    <Button onClick={startExercise}>
                      <Play className="h-4 w-4 mr-2" />
                      Comenzar Ejercicio
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
              <p>Genera código para comenzar el ejercicio.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

