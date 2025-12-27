'use client';

import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart";
import {CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis} from "recharts";
import Link from "next/link";
import {useUser} from "@clerk/nextjs";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";

const chartConfig: ChartConfig = {
    Trimestre: {
        label: "Voto",
        color: "hsl(var(--chart-1))",
    },
};

interface Grade {
    voto: number;
    subject: string;
    data: string;
    note?: string;
    month?: string; // opzionale, se lo usi per l'asse X
}

function TrimestreView() {
    const [data, setData] = useState<Grade[]>([]);
    const [average, setAverage] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [trimestre, setTrimestre] = useState<number | null>(null);

    const {user, isLoaded} = useUser();
    const userId = user?.id;

    useEffect(() => {
        if (!isLoaded) return;

        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/grades?action=trimestre&id_utente=${userId}`);

                if (!response.ok) {
                    console.error("Errore API:", response.status);
                    setData([]);
                    return;
                }

                const result = await response.json();
                console.log("TRIMESTRE" + result.grades)
                const grades = Array.isArray(result) ? result : result.grades || [];

                setData(grades);

                if (grades.length > 0) {
                    const media = (grades.reduce((sum: any, g: any) => sum + g.voto, 0) / grades.length).toFixed(2);
                    setAverage(parseFloat(media));
                } else {
                    setAverage(null);
                    setTrimestre(null);
                }

                setTrimestre(grades.length);
            } catch (error) {
                console.error('Errore nel fetch dei voti:', error);
                setData([]);
                setTrimestre(0);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, isLoaded]);

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
        <div className = "container mx-auto p-4" >
            <h1 className = "text-3xl font-bold text-center mb-8" >Trimestre</h1 >

            <Card className = "max-w-6xl mx-auto" >
                <CardHeader >
                    <div className = "flex justify-between items-start" >
                    <CardTitle className = "text-2xl" >Andamento Voti - Trimestre</CardTitle >
                        <Link
                            href = "/dashboard"
                            className = "text-sm text-blue-600 hover:underline"
                        >
                            ← Torna alla Dashboard
                        </Link >
                    </div >
                </CardHeader >

                <CardContent >
                    {
                        data.length === 0 ? (
                            <div className = "text-center py-10" >
                                <p className = "text-muted-foreground" >
                                    Nessun voto registrato per il trimestre.
                                </p >
                            </div >
                        ) : (
                            <ChartContainer config = {chartConfig}
                                            className = "h-[400px] w-full" >
                                <LineChart
                                    data = {data}
                                    margin = {{top: 20, right: 30, left: 20, bottom: 20}}
                                >
                                    <CartesianGrid strokeDasharray = "3 3" />
                                    <XAxis
                                        dataKey = "month"
                                        tickLine = {false}
                                        axisLine = {false}
                                        tickMargin = {10}
                                    />

                                    <YAxis
                                        domain = {[0, 10]}
                                        ticks = {[0, 2, 4, 6, 8, 10]}
                                        tickMargin = {8}
                                    />

                                    <ChartTooltip content = {<ChartTooltipContent indicator = {"line"} />} />

                                    <Line
                                        type = "monotone"
                                        dataKey = "voto"
                                        stroke = "hsl(var(--chart-1))"
                                        fill = "url(#fillTrimestre)"
                                        strokeWidth = {2}
                                        dot = {{r: 3}}
                                        activeDot = {{r: 6}}
                                        name = "Voto"
                                    >
                                        <LabelList
                                            position = "top"
                                            offset = {12}
                                            dataKey = {"voto"}
                                            className = "fill-foreground"
                                            fontSize = {12}
                                            formatter = {(v: number | undefined) => v ?? ''}
                                        />
                                    </Line >
                                </LineChart >
                            </ChartContainer >
                        )
                    }
                </CardContent >

                <CardFooter className = "flex flex-col sm:flex-row justify-between gap-4 border-t pt-4" >
                    <div >
                        <p className = "text-lg" >
                            <strong >Media Trimestre:</strong >{' '}
                            {average !== null ? average.toFixed(2) : 'N/A'}
                        </p >
                        <p className = "text-lg" >
                            <strong >Voti registrati:</strong > {trimestre}
                        </p >
                    </div >
                </CardFooter >
            </Card >

            {/* Tabella voti */}
            <Card className = "max-w-6xl mx-auto mt-8" >
                <CardHeader >
                    <CardTitle >Dettaglio Voti</CardTitle >
                </CardHeader >
                <CardContent >
                    <ScrollArea className = "h-[400px] w-full rounded-md border" >
                        <Table >
                            <TableHeader >
                                <TableRow >
                                    <TableHead >Voto</TableHead >
                                    <TableHead >Materia</TableHead >
                                    <TableHead >Data</TableHead >
                                    <TableHead >Note</TableHead >
                                </TableRow >
                            </TableHeader >
                            <TableBody >
                                {
                                    data.length === 0 ? (
                                        <TableRow >
                                            <TableCell colSpan = {4}
                                                       className = "text-center text-muted-foreground" >
                                              Nessun voto disponibile
                                            </TableCell >
                                          </TableRow >
                                    ) : (
                                        data.map((entry, index) => (
                                            <TableRow key = {index} >
                                                <TableCell className = "font-medium" >{entry.voto}</TableCell >
                                                <TableCell >{entry.subject}</TableCell >
                                                <TableCell >{entry.data}</TableCell >
                                                <TableCell >{entry.note || '-'}</TableCell >
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
    );
}

export default TrimestreView;