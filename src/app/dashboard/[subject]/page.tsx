'use client';

import React, {useEffect, useState} from 'react';
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart";
import {useUser} from "@clerk/nextjs";
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {CartesianGrid, LabelList, Legend, Line, LineChart, XAxis, YAxis,} from "recharts";
import Link from "next/link";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {ScrollArea} from "@/components/ui/scroll-area";

const chartConfig: ChartConfig = {
    Trimestre: {
        label: "Trimestre",
        color: "hsl(var(--chart-1))",
    },
    Pentamestre: {
        label: "Pentamestre",
        color: "hsl(var(--chart-2))",
    },
};

const mesiOrdine = ["set", "ott", "nov", "dic", "gen", "feb", "mar", "apr", "mag", "giu"];

type PageProps = {
    params: { subject: string };
};

export default function Page({params}: PageProps) {
    const {subject: encodedSubject} = params;
    const subject = decodeURIComponent(encodedSubject); // Gestisce spazi

    const {user, isLoaded} = useUser();
    const userId = user?.id;

    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]); // Dati per il grafico
    const [gradesList, setGradesList] = useState<any[]>([]); // Dati grezzi per la tabella
    const [averageTrimestre, setAverageTrimestre] = useState<number | null>(null);
    const [averagePentamestre, setAveragePentamestre] = useState<number | null>(null);

    useEffect(() => {
        if (!isLoaded || !userId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `/api/grades?subject=${encodeURIComponent(subject)}&action=fetchGrades&id_utente=${userId}`
                );

                if (!response.ok) {
                    console.error("Errore API:", response.status);
                    setChartData([]);
                    setGradesList([]);
                    return;
                }

                const result = await response.json();
                const grades = result.grades || [];

                if (grades.length === 0) {
                    setChartData([]);
                    setGradesList([]);
                    setAverageTrimestre(null);
                    setAveragePentamestre(null);
                    return;
                }

                // Salva la lista voti per la tabella (ordinata per data)
                const sortedGrades = grades.sort(
                    (a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime()
                );
                setGradesList(sortedGrades);

                // Prepara dati per il grafico mensile
                const formattedChartData = mesiOrdine.map((mese) => {
                    const votoTrimestre = sortedGrades.find((g: any) => {
                        const m = new Date(g.data).toLocaleDateString('it-IT', {month: 'short'}).toLowerCase();
                        return m === mese && g.periodo === 'trimestre';
                    });

                    const votoPentamestre = sortedGrades.find((g: any) => {
                        const m = new Date(g.data).toLocaleDateString('it-IT', {month: 'short'}).toLowerCase();
                        return m === mese && g.periodo === 'pentamestre';
                    });

                    return {
                        month: mese.charAt(0).toUpperCase() + mese.slice(1),
                        Trimestre: votoTrimestre ? Number(votoTrimestre.voto) : undefined,
                        Pentamestre: votoPentamestre ? Number(votoPentamestre.voto) : undefined,
                    };
                });

                setChartData(formattedChartData);

                // Calcolo medie
                const votiTrimestre = grades
                    .filter((g: any) => g.periodo === 'trimestre')
                    .map((g: any) => Number(g.voto));

                const votiPentamestre = grades
                    .filter((g: any) => g.periodo === 'pentamestre')
                    .map((g: any) => Number(g.voto));

                setAverageTrimestre(
                    votiTrimestre.length > 0
                        ? votiTrimestre.reduce((a: any, b: any) => a + b, 0) / votiTrimestre.length
                        : null
                );

                setAveragePentamestre(
                    votiPentamestre.length > 0
                        ? votiPentamestre.reduce((a: any, b: any) => a + b, 0) / votiPentamestre.length
                        : null
                );

            } catch (error) {
                console.error("Errore fetch voti:", error);
                setChartData([]);
                setGradesList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subject, userId, isLoaded]);

    if (!isLoaded || loading) {
        return (
            <div className = "flex items-center justify-center min-h-screen" >
        <p className = "text-xl" >Caricamento...</p >
      </div >
        );
    }

    if (!userId) {
        return (
            <div className = "flex items-center justify-center min-h-screen" >
        <p >Devi essere loggato per vedere i voti.</p >
      </div >
        );
    }

    return (
        <div className = "container mx-auto p-6 space-y-8" >
            <div className = "flex justify-between items-center" >
        <h1 className = "text-3xl font-bold" >{subject}</h1 >
        <Link
            href = "/dashboard"
            className = "bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          ← Torna alla Dashboard
        </Link >
            </div >

            {/* Grafico */}
            <Card >
            <CardHeader >
                <CardTitle className = "text-center text-2xl" >
                    Andamento voti - {subject}
                </CardTitle >
            </CardHeader >
            <CardContent >
                {
                    chartData.length === 0 || chartData.every(d => !d.Trimestre && !d.Pentamestre) ? (
                        <p className = "text-center text-muted-foreground py-10" >
                            Nessun voto inserito per questa materia
                        </p >
                    ) : (
                        <ChartContainer config = {chartConfig} >
                            <LineChart data = {chartData}
                                       margin = {{top: 40, bottom: 20, left: 20, right: 20}} >
                                <CartesianGrid vertical = {false}
                                               strokeDasharray = "4 4" />
                                <XAxis
                                    dataKey = "month"
                                    tickLine = {false}
                                    axisLine = {false}
                                    tickMargin = {10}
                                />
                                <YAxis
                                    domain = {[0, 10]}
                                    ticks = {[0, 2, 4, 6, 8, 10]}
                                    tickLine = {false}
                                    axisLine = {false}
                                />
                                <ChartTooltip content = {<ChartTooltipContent />} />
                                <Legend />

                                <Line
                                    type = "monotone"
                                    dataKey = "Trimestre"
                                    stroke = "var(--chart-1)"
                                    strokeWidth = {3}
                                    dot = {{r: 6, fill: "var(--chart-1)"}}
                                    activeDot = {{r: 8}}
                                    connectNulls = {false}
                                >
                                    <LabelList
                                        dataKey = "Trimestre"
                                        position = "top"
                                        offset = {10}
                                        fontSize = {13}
                                        fontWeight = "bold"
                                        formatter = {(v: any) => v ?? ''}
                                    />
                                </Line >

                                <Line
                                    type = "monotone"
                                    dataKey = "Pentamestre"
                                    stroke = "var(--chart-2)"
                                    strokeWidth = {3}
                                    dot = {{r: 6, fill: "var(--chart-2)"}}
                                    activeDot = {{r: 8}}
                                    connectNulls = {false}
                                >
                                    <LabelList
                                        dataKey = "Pentamestre"
                                        position = "top"
                                        offset = {10}
                                        fontSize = {13}
                                        fontWeight = "bold"
                                        formatter = {(v: any) => v ?? ''}
                                    />
                                </Line >
                            </LineChart >
                        </ChartContainer >
                    )
                }
            </CardContent >
            <CardFooter className = "flex flex-col sm:flex-row justify-center gap-6 text-lg" >
                <p >
                    <strong >Media Trimestre:</strong >{' '}
                    <span className = "text-blue-600 font-bold" >
                        {averageTrimestre !== null ? averageTrimestre.toFixed(2) : 'N/A'}
                    </span >
                </p >
                <p >
                    <strong >Media Pentamestre:</strong >{' '}
                    <span className = "text-purple-600 font-bold" >
                    {averagePentamestre !== null ? averagePentamestre.toFixed(2) : 'N/A'}
                    </span >
                </p >
            </CardFooter >
        </Card >

            {/* Tabella voti */}
            <Card >
            <CardHeader >
                <CardTitle className = "text-2xl" >Dettaglio voti</CardTitle >
            </CardHeader >
            <CardContent >
                <ScrollArea className = "h-[400px] w-full rounded-md border" >
                    <Table >
                        <TableHeader >
                            <TableRow >
                                <TableHead >Voto</TableHead >
                                <TableHead >Periodo</TableHead >
                                <TableHead >Data</TableHead >
                                <TableHead >Note</TableHead >
                            </TableRow >
                        </TableHeader >
                        <TableBody >
                            {
                                gradesList.length === 0 ? (
                                    <TableRow >
                                        <TableCell colSpan = {4}
                                                   className = "text-center text-muted-foreground py-8" >
                                            Nessun voto registrato
                                        </TableCell >
                                    </TableRow >
                                ) : (
                                    gradesList.map((grade, index) => (
                                            <TableRow key = {index} >
                                            <TableCell className = "font-semibold text-lg" >
                                                {grade.voto}
                                            </TableCell >
                                            <TableCell >
                                                {grade.periodo === 'trimestre' ? 'Trimestre' : 'Pentamestre'}
                                            </TableCell >
                                            <TableCell >
                                                {new Date(grade.data).toLocaleDateString('it-IT')}
                                            </TableCell >
                                            <TableCell >{grade.note || '-'}</TableCell >
                                        </TableRow >
                                        )
                                    )
                                )
                            }
                        </TableBody >
                    </Table >
                </ScrollArea >
            </CardContent >
        </Card >
    </div >
    );
}