'use client'

import React, {useEffect, useState} from 'react'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {CartesianGrid, LabelList, Legend, Line, LineChart, XAxis, YAxis} from "recharts";
import Link from "next/link";
import {useUser} from "@clerk/nextjs";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"

const chartConfig: ChartConfig = {
    Pentamestre: {
        label: "pentamestre",
        color: "var(--chart-1)",
    }
};

interface Grade {
    voto: number;
    subject: string;
    data: string;
    note?: string;
    month?: string; // opzionale, se lo usi per l'asse X
}

function PentamestreView() {
    const [data, setdata] = useState<any[]>([]);
    const [average, setaverage] = useState<number | null>(null);
    const [loading, setloading] = useState(true);
    const [pentamestre, setPentamestre] = useState<number | null>(null);

    const {user, isLoaded} = useUser();
    const userId = user?.id;

    useEffect(() => {

        if (!isLoaded) return;

        if (!userId) {
            setloading(false);
            return;
        }

        const fetchData = async () => {
            setloading(true);

            try {
                const response = await fetch(`/api/grades?action=pentamestre&id_utente=${userId}`);

                if (!response.ok) {
                    console.error("Errore " + response.status);
                    setdata([]);
                    return;
                }

                const result = await response.json();
                console.log("PENTAMESTRE: " + result.grades);
                const grades = Array.isArray(result) ? result : result.grades || [];

                setdata(grades);

                if (grades.length > 0) {
                    const media = (grades.reduce((sum: number, g: any) => sum + g.voto, 0) / grades.length).toFixed(2);
                    setaverage(parseFloat(media));
                } else {
                    setaverage(null);
                    setPentamestre(null);
                }

                setPentamestre(grades.length);

            } catch (error) {
                console.error('Errore fetch voti:', error);
                setdata([]);
                setPentamestre(null);
            } finally {
                setloading(false);
            }
        };

        fetchData();
    }, [userId, isLoaded]);

    if (!isLoaded || loading) {
        return (
            <div className = "flex items-center justify-center min-h-screen" >
                <p className = {'text-xl'} >Caricamento...</p >
            </div >
        )
    }

    if (!userId) {
        return (
            <div className = "flex items-center justify-center min-h-screen" >
                <p >Devi eesere loggato per vedere i voti</p >
            </div >
        );
    }

    return (
        <div className = "container mx-auto p-4" >
            <h1 className = {'text-3xl font-bold text-center mb-8'} >Pentamestre</h1 >
            <Card className = "w-full h-96 mx-auto" >
                <CardHeader >
                    <CardTitle className = {'text-2xl'} >Andamento Voti - Pentamestre</CardTitle >
                    <div className = "flex w-full items-start gap-2 text-sm float-right" >
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
                        <div className = {"text-center py-10"} >
                            <p className = 'text-muted-foreground' >
                                Nessun dato trovato per il Pentamestre
                            </p >
                        </div >
                    ) : (
                        <ChartContainer config = {chartConfig}
                                        className = {"h-[400px] w-full"} >
                            <LineChart
                                data = {data}
                                margin = {{left: 12, right: 12, top: 20, bottom: 20}}
                            >
                                <CartesianGrid vertical = {false}
                                               strokeDasharray = "3 3" />
                                <XAxis
                                    dataKey = "month"
                                    tickLine = {false}
                                    axisLine = {false}
                                    tickMargin = {8}
                                />
                                <YAxis
                                    domain = {[0, 10]}
                                    ticks = {[0, 2, 4, 6, 8, 10]}
                                    tickMargin = {8}
                                />
                                <ChartTooltip content = {<ChartTooltipContent indicator = {"line"} />} />
                                <Legend />

                                <Line
                                    type = "monotone"
                                    dataKey = "Pentamester"
                                    stroke = "var(--chart-1)"
                                    fill = "url(#fillPentamestre)"
                                    strokeWidth = {2}
                                    dot = {{r: 2}}
                                    activeDot = {{r: 5}}
                                    name = "Voto"
                                >
                                    <LabelList
                                        position = {"top"}
                                        offset = {12}
                                        dataKey = "voto"
                                        className = "fill-foreground"
                                        fontSize = {12}
                                        formatter = {(value: number | undefined) => value ?? ""}
                                    />
                                </Line >
                            </LineChart >
                        </ChartContainer >
                    )
                }
                </CardContent >
                <CardFooter >
                    <div >
                        <p ><strong >Media Pentamester: </strong >
                            {average !== null ? average.toFixed(2) : 'N/A'}
                        </p >
                        <p className = "text-lg" >
                            <strong >Voti Registrati:</strong >{pentamestre}
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
    )
}

export default PentamestreView;