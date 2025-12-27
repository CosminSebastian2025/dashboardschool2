'use client';

import React, {useEffect, useState} from 'react';
import {CartesianGrid, LabelList, Legend, Line, LineChart, XAxis, YAxis} from "recharts";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {useRouter} from "next/navigation";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {useUser} from "@clerk/nextjs";

type SubjectsAverageProps = {
    materia: string;
};

const chartConfig: ChartConfig = {
    Trimestre: {
        label: "Trimestre",
        color: "var(--chart-1)",
    },
    Pentamestre: {
        label: "Pentamestre",
        color: "var(--chart-2)",
    },
};

const mesiOrdine = ["set", "ott", "nov", "dic", "gen", "feb", "mar", "apr", "mag", "giu"];

export function SubjectsAverage({materia}: SubjectsAverageProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [averageTrimestre, setAverageTrimestre] = useState<number | null>(null);
    const [averagePentamestre, setAveragePentamestre] = useState<number | null>(null);
    const router = useRouter();

    const {user} = useUser();
    const userId = user?.id;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // GET /api/grades?subject=...&action=voti
                // - Metodo: GET verso un endpoint relativo dell'app Next.js (/api/grades).
                // - Query string: subject=encodeURIComponent(materia) aggiunge il nome della materia in modo sicuro.
                // - action=voti indica al backend quale operazione eseguire (qui: ottenere i voti per la materia).
                // - Nota: essendo un URL relativo, questa richiesta viene inviata allo stesso origin (host/porta) dell'app.
                //   Non l'ho eseguita qui perché il server Next.js non è stato avviato in questo ambiente.
                //   Per eseguirla localmente: avvia `npm run dev` nella root del progetto e poi apri l'app o usa curl verso http://localhost:3000/api/grades?...
                const response = await fetch(`/api/grades?subject=${encodeURIComponent(materia)}&action=voti&id_utente=${userId}`);

                // Se la risposta non è OK (status 200-299) loggala e interrompi l'elaborazione.
                if (!response.ok) {
                    console.error('Errore API:', response.status);
                    setData([]);
                    return;
                }

                // Parse del body JSON. Si aspetta un oggetto con chiave `grades` contenente un array di voti.
                const result = await response.json();
                const grades = result.grades || [];

                if (grades.length === 0) {
                    setData([]);
                    setAverageTrimestre(null);
                    setAveragePentamestre(null);
                    return;
                }

                // Ordina per data
                const sortedGrades = grades.sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime());

                // Raggruppa per mese
                const chartData = mesiOrdine.map((mese) => {
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
                        Trimestre: votoTrimestre ? votoTrimestre.voto : undefined,
                        Pentamestre: votoPentamestre ? votoPentamestre.voto : undefined,
                    };
                });

                setData(chartData);

                // Calcola medie
                const allTrimestre = grades.filter((g: any) => g.periodo === 'trimestre').map((g: any) => g.voto);
                const allPentamestre = grades.filter((g: any) => g.periodo === 'pentamestre').map((g: any) => g.voto);

                setAverageTrimestre(allTrimestre.length > 0
                    ? allTrimestre.reduce((a: any, b: any) => a + b, 0) / allTrimestre.length
                    : null
                );
                setAveragePentamestre(allPentamestre.length > 0
                    ? allPentamestre.reduce((a: any, b: any) => a + b, 0) / allPentamestre.length
                    : null
                );

            } catch (error) {
                console.error('Errore fetch voti:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [materia, userId]);

    const handleButtonClick = () => {
        router.push(`/dashboard/${encodeURIComponent(materia)}/addGrade`);
    };

    return (
        <div className = "bg-emerald-400 text-white font-bold p-4 rounded-3xl shadow-md w-96 h-auto flex flex-col justify-center items-center" >
            <Card className = "w-full h-full rounded-3xl" >
                <CardHeader >
                    <h2 className = "text-2xl" >{materia}</h2 >
                </CardHeader >

                <CardContent >
                    {loading ? (
                        <div className = "flex items-center justify-center h-32" >
                            <p className = "text-lg" >Caricamento dati...</p >
                        </div >
                    ) : data.length === 0 ? (
                        <div className = "flex flex-col items-center justify-center h-32 text-center" >
                            <p className = "text-lg mb-2" >Nessun voto inserito</p >
                            <p className = "text-sm opacity-80" >Clicca "Aggiungi Voto" per iniziare</p >
                        </div >
                    ) : (
                        <ChartContainer config = {chartConfig} >
                            <LineChart
                                data = {data}
                                margin = {{left: 12, right: 12, top: 20, bottom: 20}}
                            >
                                <CartesianGrid vertical = {false}
                                               strokeDasharray = "3 3" />
                                <XAxis dataKey = "month"
                                       tickLine = {false}
                                       axisLine = {false}
                                       tickMargin = {8} />

                                <YAxis ticks = {[0, 2, 4, 6, 8, 10]}
                                       domain = {[0, 10]}
                                       tickMargin = {8} />

                                <ChartTooltip
                                    cursor = {false}
                                    content = {<ChartTooltipContent indicator = "line" />} />
                                <Legend />

                                <Line
                                    type = "monotone"
                                    dataKey = "Trimestre"
                                    stroke = "var(--chart-1)"
                                    strokeWidth = {2}
                                    fill = "url(#fillTrimestre)"
                                    dot = {{fill: "var(--chart-1)", r: 3}}
                                    activeDot = {{r: 6}}
                                    connectNulls = {false}
                                >
                                    <LabelList
                                        position = "top"
                                        offset = {12}
                                        dataKey = {"Trimestre"}
                                        className = "fill-foreground"
                                        fontSize = {12}
                                        formatter = {(v: number | undefined) => v ?? ''}
                                    />
                                </Line >

                                <Line
                                    type = "monotone"
                                    dataKey = "Pentamestre"
                                    stroke = "var(--chart-2)"
                                    fill = "url(#fillPentamestre)"
                                    dot = {{fill: "var(--color-desktop)", r: 3}}
                                    activeDot = {{r: 6}}
                                    connectNulls = {false}
                                >
                                    <LabelList
                                        position = "top"
                                        offset = {12}
                                        dataKey = {"Pentamestre"}
                                        className = "fill-foreground"
                                        fontSize = {12}
                                        formatter = {(v: number | undefined) => v ?? ''}
                                    />
                                </Line >
                            </LineChart >
                        </ChartContainer >
                    )}
                </CardContent >

                <div className = "flex flex-col items-center justify-center p-4" >
                    <p className = "text-xl mb-1" >Media di {materia}</p >
                    <p className = "text-sm" >
                        Trimestre:{' '}
                        <span className = "font-semibold" >
                            {averageTrimestre ? averageTrimestre.toFixed(2) : 'N/A'}
                        </span >{' '}
                        | Pentamestre:{' '}
                        <span className = "font-semibold" >
                            {averagePentamestre ? averagePentamestre.toFixed(2) : 'N/A'}
                        </span >
                    </p >
                    <button
                        onClick = {handleButtonClick}
                        className = "mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Aggiungi Voto
                    </button >
                </div >
            </Card >
        </div >
    );
}
