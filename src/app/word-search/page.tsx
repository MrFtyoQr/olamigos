"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw, CheckCircle } from "lucide-react"

interface WordSearchAnswer {
  word: string
  start: [number, number]
  end: [number, number]
  direction: string
}

interface WordSearchData {
  word_search: {
    word_search: string
    answers: WordSearchAnswer[]
  }
}

export default function WordSearchPage() {
  const [topic, setTopic] = useState("MongoDB")
  const [size, setSize] = useState(10)
  const [wordSearchData, setWordSearchData] = useState<WordSearchData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  const [gridArray, setGridArray] = useState<string[][]>([])

  const fetchWordSearch = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `http://localhost:8000/api/word-search?topic=${encodeURIComponent(topic)}&size=${size}`,
      )
      const data = await response.json()
      setWordSearchData(data)

      // Convert the word search string to a 2D array
      const rows = data.word_search.word_search.split("\n")
      const grid = rows.map((row) => row.split(" ").filter((cell) => cell))
      setGridArray(grid)

      // Reset found words
      setFoundWords([])
    } catch (error) {
      console.error("Error fetching word search:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWordSearch()
  }, [])

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const cellId = `${rowIndex}-${colIndex}`

    if (selectedCells.includes(cellId)) {
      // If this is the second click on the same cell, clear selection
      if (selectedCells.length === 1) {
        setSelectedCells([])
      }
      return
    }

    if (selectedCells.length === 0) {
      // First cell selection
      setSelectedCells([cellId])
    } else if (selectedCells.length === 1) {
      // Second cell selection - validate the word
      const [startCell] = selectedCells
      const [startRow, startCol] = startCell.split("-").map(Number)

      const newSelection = [...selectedCells, cellId]
      setSelectedCells(newSelection)

      // Check if this forms a valid word
      if (wordSearchData) {
        const foundAnswer = wordSearchData.word_search.answers.find((answer) => {
          const [answerStartRow, answerStartCol] = answer.start
          const [answerEndRow, answerEndCol] = answer.end

          return (
            (startRow === answerStartRow - 1 &&
              startCol === answerStartCol - 1 &&
              rowIndex === answerEndRow - 1 &&
              colIndex === answerEndCol - 1) ||
            (startRow === answerEndRow - 1 &&
              startCol === answerEndCol - 1 &&
              rowIndex === answerStartRow - 1 &&
              colIndex === answerStartCol - 1)
          )
        })

        if (foundAnswer) {
          // Valid word found
          if (!foundWords.includes(foundAnswer.word)) {
            setFoundWords((prev) => [...prev, foundAnswer.word])
          }
        }

        // Clear selection after validation
        setTimeout(() => {
          setSelectedCells([])
        }, 1000)
      }
    }
  }

  const isCellSelected = (rowIndex: number, colIndex: number) => {
    return selectedCells.includes(`${rowIndex}-${colIndex}`)
  }

  const isWordFound = (word: string) => {
    return foundWords.includes(word)
  }

  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-2xl">Sopa de Letras</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="topic">Tema</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ingresa un tema"
                className="mb-2"
              />
            </div>
            <div className="w-24">
              <Label htmlFor="size">Tamaño</Label>
              <Input
                id="size"
                type="number"
                min="5"
                max="15"
                value={size}
                onChange={(e) => setSize(Number.parseInt(e.target.value))}
                className="mb-2"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchWordSearch} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Generar
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : wordSearchData ? (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 overflow-x-auto">
                <div className="word-search-grid bg-white dark:bg-gray-800 p-4 rounded-lg shadow-inner">
                  {gridArray.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center">
                      {row.map((cell, colIndex) => (
                        <span
                          key={`${rowIndex}-${colIndex}`}
                          className={`cursor-pointer transition-colors ${
                            isCellSelected(rowIndex, colIndex) ? "highlighted" : ""
                          }`}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                          {cell}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-1/3">
                <h3 className="font-bold mb-2">Palabras a encontrar:</h3>
                <ul className="space-y-2">
                  {wordSearchData.word_search.answers.map((answer) => (
                    <li
                      key={answer.word}
                      className={`flex items-center ${
                        isWordFound(answer.word)
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {isWordFound(answer.word) && <CheckCircle className="h-4 w-4 mr-2" />}
                      {answer.word}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">No se ha generado ninguna sopa de letras.</div>
          )}
        </CardContent>
        <CardFooter className="bg-card border-t p-4 justify-between">
          <div>
            {wordSearchData && (
              <p>
                Encontradas: {foundWords.length} de {wordSearchData.word_search.answers.length}
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

