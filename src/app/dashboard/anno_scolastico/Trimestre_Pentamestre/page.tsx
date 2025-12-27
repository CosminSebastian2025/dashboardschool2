'use client'

import React, {useEffect, useState} from 'react'
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"
import {CartesianGrid, LabelList, Legend, Line, LineChart, XAxis, YAxis,} from "recharts"
import Link from "next/link"
import {ScrollArea,} from "@/components/ui/scroll-area"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {useUser} from "@clerk/nextjs"

const chartConfig: ChartConfig = {
    Trimestre: {
        label: "Trimestre",
        color: "var(--chart-1)",
    },
    Pentamestre: {
        label: "Pentamestre",
        color: "var(--chart-2)",
    },
}

const mesiOrdine = ["set", "ott", "nov", "dic", "gen", "feb", "mar", "apr", "mag", "giu"]

export default function Anno_Scolastico() {
    const [chartData, setChartData] = useState<any[]>([])
    const [gradesList, setGradesList] = useState<any[]>([])
    const [averageTrimestre, setAverageTrimestre] = useState<number | null>(null)
    const [averagePentamestre, setAveragePentamestre] = useState<number | null>(null)
    const [totalAverage, setTotalAverage] = useState<number | null>(null)
    const [totalVotes, setTotalVotes] = useState<number>(0)
    const [trimestreVotes, setTrimestreVotes] = useState<number>(0)
    const [pentamestreVotes, setPentamestreVotes] = useState<number>(0)
    const [loading, setLoading] = useState(true)

    const {user, isLoaded} = useUser()
    const userId = user?.id

    useEffect(() => {
        if (!isLoaded || !userId) {
            setLoading(false)
            return
        }

        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await fetch(`/api/grades?action=allGrades&id_utente=${userId}`)

                if (!response.ok) {
                    console.error("Errore API:", response.status)
                    return
                }

                const result = await response.json()
                const grades = Array.isArray(result) ? result : result.grades || []

                if (grades.length === 0) return

                const sortedGrades = grades.sort(
                    (a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime()
                )

                setGradesList(sortedGrades)

                // Dati per grafico
                const formattedChartData = mesiOrdine.map((mese) => {
                    const votoTrimestre = sortedGrades.find((g: any) => {
                        const m = new Date(g.data).toLocaleDateString('it-IT', {month: 'short'}).toLowerCase()
                        return m === mese && g.periodo === 'trimestre'
                    })
                    const votoPentamestre = sortedGrades.find((g: any) => {
                        const m = new Date(g.data).toLocaleDateString('it-IT', {month: 'short'}).toLowerCase()
                        return m === mese && g.periodo === 'pentamestre'
                    })

                    return {
                        month: mese.charAt(0).toUpperCase() + mese.slice(1),
                        Trimestre: votoTrimestre ? Number(votoTrimestre.voto) : undefined,
                        Pentamestre: votoPentamestre ? Number(votoPentamestre.voto) : undefined,
                    }
                })

                setChartData(formattedChartData)

                // Calcoli medie e conteggi
                const trimVotes = sortedGrades.filter((g: { periodo: string }) => g.periodo === 'trimestre');
                const pentVotes = sortedGrades.filter((g: { periodo: string }) => g.periodo === 'pentamestre');

                const trimValues = trimVotes.map((g: any) => Number(g.voto));
                const pentValues = pentVotes.map((g: any) => Number(g.voto));

                setTrimestreVotes(trimVotes.length)
                setPentamestreVotes(pentVotes.length)
                setTotalVotes(trimVotes.length + pentVotes.length)

                setAverageTrimestre(trimValues.length > 0 ? trimValues.reduce((a: any, b: any) => a + b, 0) / trimValues.length : null)
                setAveragePentamestre(pentValues.length > 0 ? pentValues.reduce((a: any, b: any) => a + b, 0) / pentValues.length : null)

                const allValues = [...trimValues, ...pentValues]
                setTotalAverage(allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : null)

            } catch (error) {
                console.error('Errore fetch voti:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [userId, isLoaded])

    if (!isLoaded || loading) return <div className = "flex items-center justify-center min-h-screen" >Caricamento...</div >
    if (!userId) return <div className = "flex items-center justify-center min-h-screen" >Devi essere loggato</div >

    return (
        <div className = "container mx-auto p-4 space-y-8" >
            <h1 className = "text-3xl font-bold text-center" >Anno Scolastico</h1 >

            <Card className = "max-w-6xl mx-auto" >
                <CardHeader >
                    <div className = "flex justify-between items-start" >
                        <CardTitle className = "text-2xl" >Andamento Voti - Tutte le materie</CardTitle >
                        <Link href = "/dashboard"
                              className = "text-blue-600 hover:underline" >
                        ← Torna alla Dashboard
                        </Link >
                    </div >
                </CardHeader >

                <CardContent >
                    {
                        chartData.length === 0 ? (
                            <div className = "text-center py-10 text-muted-foreground" >
                            Nessun voto registrato
                        </div >
                        ) : (
                            <ChartContainer config = {chartConfig} >
                                <LineChart data = {chartData}
                                           margin = {{top: 30, bottom: 20, left: 20, right: 20}} >
                                    <CartesianGrid vertical = {false}
                                                   strokeDasharray = "3 3" />
                                    <XAxis dataKey = "month"
                                           tickLine = {false}
                                           axisLine = {false}
                                           tickMargin = {8} />
                                    <YAxis domain = {[0, 10]}
                                           ticks = {[0, 2, 4, 6, 8, 10]}
                                           tickLine = {false}
                                           axisLine = {false}
                                           tickMargin = {8} />
                                    <ChartTooltip content = {<ChartTooltipContent />} />
                                    <Legend />

                                    <Line
                                        type = "monotone"
                                        dataKey = "Trimestre"
                                        stroke = "var(--chart-1)"
                                        strokeWidth = {2}
                                        dot = {{fill: "var(--chart-1)", r: 4}}
                                        activeDot = {{r: 6}}
                                        connectNulls = {false}
                                    >
                                        <LabelList
                                            dataKey = "Trimestre"
                                            position = "top"
                                            offset = {12}
                                            fontSize = {12}
                                            formatter = {(v: any) => v ?? ''}
                                        />
                                    </Line >

                                    <Line
                                        type = "monotone"
                                        dataKey = "Pentamestre"
                                        stroke = "var(--chart-2)"
                                        strokeWidth = {2}
                                        dot = {{fill: "var(--chart-2)", r: 4}}
                                        activeDot = {{r: 6}}
                                        connectNulls = {false}
                                    >
                                        <LabelList
                                            dataKey = "Pentamestre"
                                            position = "top"
                                            offset = {12}
                                            fontSize = {12}
                                            formatter = {(v: any) => v ?? ''}
                                        />
                                    </Line >
                                </LineChart >
                            </ChartContainer >
                        )
                    }
                </CardContent >

                <CardFooter className = "flex flex-wrap justify-around gap-6 text-center" >
                    <div >
                        <p ><strong >Media Trimestre:</strong > {averageTrimestre?.toFixed(2) ?? 'N/A'}</p >
                        <p ><strong >Voti:</strong > {trimestreVotes}</p >
                    </div >
                    <div >
                        <p ><strong >Media Pentamestre:</strong > {averagePentamestre?.toFixed(2) ?? 'N/A'}</p >
                        <p ><strong >Voti:</strong > {pentamestreVotes}</p >
                    </div >
                    <div >
                        <p ><strong >Media Totale:</strong > {totalAverage?.toFixed(2) ?? 'N/A'}</p >
                        <p ><strong >Voti Totali:</strong > {totalVotes}</p >
                    </div >
                </CardFooter >
            </Card >

            <Card className = "max-w-6xl mx-auto" >
                <CardHeader >
                    <CardTitle >Dettaglio Voti - Tutte le materie</CardTitle >
                </CardHeader >
                <CardContent >
                    <ScrollArea className = "h-[400px] w-full rounded-md border" >
                        <Table >
                            <TableHeader >
                                <TableRow >
                                    <TableHead >Voto</TableHead >
                                    <TableHead >Materia</TableHead >
                                    <TableHead >Periodo</TableHead >
                                    <TableHead >Data</TableHead >
                                    <TableHead >Note</TableHead >
                                </TableRow >
                            </TableHeader >
                            <TableBody >
                                {
                                    gradesList.length === 0 ? (
                                        <TableRow >
                                            <TableCell colSpan = {5}
                                                       className = "text-center text-muted-foreground" >
                                                Nessun voto disponibile
                                            </TableCell >
                                      </TableRow >
                                    ) : (
                                        gradesList.map((grade, index) => (
                                            <TableRow key = {index} >
                                                <TableCell className = "font-medium" >{grade.voto}</TableCell >
                                                <TableCell >{grade.materia || grade.subject || 'N/D'}</TableCell >
                                                <TableCell >{grade.periodo === 'trimestre' ? 'Trimestre' : 'Pentamestre'}</TableCell >
                                                <TableCell >{new Date(grade.data).toLocaleDateString('it-IT')}</TableCell >
                                                <TableCell >{grade.note || '-'}</TableCell >
                                            </TableRow >
                                        ))
                                    )
                                }
                            </TableBody >
                        </Table >
                    </ScrollArea >
                </CardContent >
            </Card >
        </div >
    )
}