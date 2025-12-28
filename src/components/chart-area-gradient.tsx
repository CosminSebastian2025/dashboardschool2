"use client"

import {Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart} from "recharts"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {ChartConfig, ChartContainer,} from "@/components/ui/chart"
import React, {useEffect, useState} from "react"
import {useUser} from "@clerk/nextjs";
import {Button} from "@/components/ui/button";
import {router} from "next/client";
import Link from "next/link";

const chartConfig: ChartConfig = {
    Trimestre: {
        label: "trimestre",
        color: "var(--chart-1)",
    },
    Pentamestre: {
        label: "pentamestre",
        color: "var(--chart-2)",
    }
};


export function Trimestre() {
    const [average, setAverage] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const {user, isLoaded} = useUser();
    const userId = user?.id;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/grades?action=trimestre&id_utente=${userId}`);

                if (!response.ok) {
                    console.error("Errore API:", response.status);
                    return;
                }
                // Parse JSON: il backend dovrebbe rispondere con un array o oggetto contenente i voti.
                const result = await response.json();
                const grades = Array.isArray(result) ? result : result.grades || [];

                console.log("RESULT:", result);
                console.log("GRADES:", grades);

                // Calcolo media dei voti
                if (grades.length > 0) {
                    const media = (grades.reduce((sum: number, g: any) => sum + g.voto, 0) / grades.length).toFixed(2);
                    setAverage(parseFloat(media));
                } else {
                    setAverage(null);
                }
            } catch (e) {
                console.error("Errore fetch voti:", e);
                setAverage(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const chartData = [
        {
            name: "media",
            voto: average ?? 0,
            fill: average && average >= 6 ? "#22c55e" : (average && average >= 5 && average < 6) ? "#eab308" : "#ef4444",
        }
    ];

    // @ts-ignore
    const percentuale = (average / 10) * 360;

    return (
        <Card className = "flex flex-col" >
            <CardHeader className = "items-center pb-0" >
                <CardTitle >Radial Chart - Text</CardTitle >
                <CardDescription >January - June 2024</CardDescription >
            </CardHeader >
            <CardContent className = "flex-1 pb-0" >
                {
                    loading ? (
                        <div className = "flex items-center justify-center h-32" >
                            <p className = "text-lg" >Caricamento dati...</p >
                        </div >
                    ) : average === null ? (
                        <div className = "flex flex-col items-center justify-center h-32 text-center" >
                            <p className = "text-lg mb-2" >Nessun voto inserito</p >
                            <p className = "text-sm opacity-80" >Clicca "Aggiungi Voto" per iniziare</p >
                        </div >
                    ) : (
                        <ChartContainer
                            config = {chartConfig}
                            className = "mx-auto aspect-square max-h-[250px]"
                        >
                            <RadialBarChart
                                data = {chartData}
                                startAngle = {90}
                                endAngle = {90 + percentuale}
                                innerRadius = {80}
                                outerRadius = {110}
                            >
                                <PolarGrid
                                    gridType = "circle"
                                    radialLines = {true}
                                    stroke = "none"
                                    className = "first:fill-muted last:fill-background"
                                    polarRadius = {[86, 74]}
                                />
                                <RadialBar dataKey = "voto"
                                           background = {false}
                                           cornerRadius = {10} />
                                <PolarRadiusAxis tick = {false}
                                                 tickLine = {false}
                                                 axisLine = {false} >
                                    <Label
                                        content = {({viewBox}) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text
                                                        x = {viewBox.cx}
                                                        y = {viewBox.cy}
                                                        textAnchor = "middle"
                                                        dominantBaseline = "middle"
                                                    >
                                                        <tspan
                                                            x = {viewBox.cx}
                                                            y = {viewBox.cy}
                                                            className = "fill-foreground text-4xl font-bold"
                                                        >
                                                            {average.toFixed(2) || "0.00"}
                                                        </tspan >
                                                        <tspan
                                                            x = {viewBox.cx}
                                                            y = {(viewBox.cy || 0) + 24}
                                                            className = "fill-muted-foreground"
                                                        >
                                                            Media
                                                        </tspan >
                                                    </text >
                                                )
                                            }
                                        }}
                                    />
                                </PolarRadiusAxis >
                            </RadialBarChart >
                        </ChartContainer >
                    )
                }
            </CardContent >
            <CardFooter className = "flex-col gap-2 text-sm" >
                <div className = "flex items-center gap-2 leading-none font-medium" >
                    <Link href = "/dashboard/anno_scolastico/Trimestre" >
                       <Button >View Trimestre</Button >
                   </Link >
                </div >
            </CardFooter >
        </Card >
    )
}


export function ChartAreaGradientTwo() {
    const [average, setAverage] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const {user} = useUser();
    const userId = user?.id;

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/grades?action=trimestrePentamestre&id_utente=${userId}`);

                if (!response.ok) {
                    console.error("Errore API:", response.status);
                    setAverage(null);
                    return;
                }

                const result = await response.json();
                const grades = Array.isArray(result) ? result : result.grades || [];


                /*console.log("RESULT:", result);
                console.log("GRADES:", grades);*/

                // Calcolo media dei voti
                if (grades.length > 0) {
                    const media = (grades.reduce((sum: number, g: any) => sum + g.voto, 0) / grades.length).toFixed(2);
                    setAverage(parseFloat(media));
                } else {
                    setAverage(null);
                }
            } catch (e) {
                console.error("Errore fetch voti:", e);
                setAverage(null);
            } finally {
                setLoading(false);
            }
        };


        fetchData();
    }, []);

    const chartData = [
        {
            name: "media",
            voto: average ?? 0,
            fill: average && average >= 6 ? "#22c55e" : (average && average >= 5 && average < 6) ? "#eab308" : "#ef4444",
        }
    ];

    // @ts-ignore
    const percentuale = (average / 10) * 360;

    return (
        <Card className = "flex flex-col" >
            <CardHeader className = "items-center pb-0" >
                <CardTitle >Radial Chart - Text</CardTitle >
                <CardDescription >January - June 2024</CardDescription >
            </CardHeader >
            <CardContent className = "flex-1 pb-0" >
                {
                    loading ? (
                        <div className = "flex items-center justify-center h-32" >
                            <p className = "text-lg" >Caricamento dati...</p >
                        </div >
                    ) : average === null ? (
                        <div className = "flex flex-col items-center justify-center h-32 text-center" >
                            <p className = "text-lg mb-2" >Nessun voto inserito</p >
                            <p className = "text-sm opacity-80" >Clicca "Aggiungi Voto" per iniziare</p >
                        </div >
                    ) : (
                        <ChartContainer
                            config = {chartConfig}
                            className = "mx-auto aspect-square max-h-[250px]"
                        >
                            <RadialBarChart
                                data = {chartData}
                                startAngle = {90}
                                endAngle = {90 + percentuale}
                                innerRadius = {80}
                                outerRadius = {110}
                            >
                                <PolarGrid
                                    gridType = "circle"
                                    radialLines = {true}
                                    stroke = "none"
                                    className = "first:fill-muted last:fill-background"
                                    polarRadius = {[86, 74]}
                                />
                                <RadialBar dataKey = "voto"
                                           background = {false}
                                           cornerRadius = {10} />
                                <PolarRadiusAxis tick = {false}
                                                 tickLine = {false}
                                                 axisLine = {false} >
                                    <Label
                                        content = {({viewBox}) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text
                                                        x = {viewBox.cx}
                                                        y = {viewBox.cy}
                                                        textAnchor = "middle"
                                                        dominantBaseline = "middle"
                                                    >
                                                        <tspan
                                                            x = {viewBox.cx}
                                                            y = {viewBox.cy}
                                                            className = "fill-foreground text-4xl font-bold"
                                                        >
                                                            {average.toFixed(2) || "0.00"}
                                                        </tspan >
                                                        <tspan
                                                            x = {viewBox.cx}
                                                            y = {(viewBox.cy || 0) + 24}
                                                            className = "fill-muted-foreground"
                                                        >
                                                            Media
                                                        </tspan >
                                                    </text >
                                                )
                                            }
                                        }}
                                    />
                                </PolarRadiusAxis >
                            </RadialBarChart >
                        </ChartContainer >
                    )
                }
            </CardContent >
            <CardFooter className = "flex-col gap-2 text-sm" >
                <div className = "flex items-center gap-2 leading-none font-medium" >
                   <Link href = "/dashboard/anno_scolastico/Trimestre_Pentamestre" >
                       <Button >View Anno Scolastico</Button >
                   </Link >
                </div >
            </CardFooter >
        </Card >
    )
}


export function Pentamestre() {
    const [average, setAverage] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);


    const {user, isLoaded} = useUser();
    const userId = user?.id;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/grades?action=pentamestre&id_utente=${userId}`);

                if (!response.ok) {
                    console.error("Errore API:", response.status);
                    setAverage(null);
                    return;
                }

                const result = await response.json();
                const grades = Array.isArray(result) ? result : result.grades || [];

                console.log("RESULT:", result);
                console.log("GRADES:", grades);

                // Calcolo media dei voti
                if (grades.length > 0) {
                    const media = (grades.reduce((sum: number, g: any) => sum + g.voto, 0) / grades.length).toFixed(2);
                    setAverage(parseFloat(media));
                } else {
                    setAverage(null);
                }
            } catch (e) {
                console.error("Errore fetch voti:", e);
                setAverage(null);
            } finally {
                setLoading(false);
            }
        };


        fetchData();
    }, [userId, isLoaded]);

    const handleRoute = () => {
        router.push("/dashboard/anno_scolastico/Pentamestre");
    }

    const chartData = [
        {
            name: "media",
            voto: average ?? 0,
            fill: average && average >= 6 ? "#22c55e" : (average && average >= 5 && average < 6) ? "#eab308" : "#ef4444",
        }
    ];

    // @ts-ignore
    const percentuale = (average / 10) * 360;

    return (
        <Card className = "flex flex-col" >
            <CardHeader className = "items-center pb-0" >
                <CardTitle >Radial Chart - Text</CardTitle >
                <CardDescription >January - June 2024</CardDescription >
            </CardHeader >
            <CardContent className = "flex-1 pb-0" >
                {
                    loading ? (
                        <div className = "flex items-center justify-center h-32" >
                            <p className = "text-lg" >Caricamento dati...</p >
                        </div >
                    ) : average === null ? (
                        <div className = "flex flex-col items-center justify-center h-32 text-center" >
                            <p className = "text-lg mb-2" >Nessun voto inserito</p >
                            <p className = "text-sm opacity-80" >Clicca "Aggiungi Voto" per iniziare</p >
                        </div >
                    ) : (
                        <ChartContainer
                            config = {chartConfig}
                            className = "mx-auto aspect-square max-h-[250px]"
                        >
                            <RadialBarChart
                                data = {chartData}
                                startAngle = {90}
                                endAngle = {90 + percentuale}
                                innerRadius = {80}
                                outerRadius = {110}
                            >
                                <PolarGrid
                                    gridType = "circle"
                                    radialLines = {true}
                                    stroke = "none"
                                    className = "first:fill-muted last:fill-background"
                                    polarRadius = {[86, 74]}
                                />
                                <RadialBar dataKey = "voto"
                                           background = {false}
                                           cornerRadius = {10} />
                                <PolarRadiusAxis tick = {false}
                                                 tickLine = {false}
                                                 axisLine = {false} >
                                    <Label
                                        content = {({viewBox}) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text
                                                        x = {viewBox.cx}
                                                        y = {viewBox.cy}
                                                        textAnchor = "middle"
                                                        dominantBaseline = "middle"
                                                    >
                                                        <tspan
                                                            x = {viewBox.cx}
                                                            y = {viewBox.cy}
                                                            className = "fill-foreground text-4xl font-bold"
                                                        >
                                                            {average.toFixed(2) || "0.00"}
                                                        </tspan >
                                                        <tspan
                                                            x = {viewBox.cx}
                                                            y = {(viewBox.cy || 0) + 24}
                                                            className = "fill-muted-foreground"
                                                        >
                                                            Media
                                                        </tspan >
                                                    </text >
                                                )
                                            }
                                        }}
                                    />
                                </PolarRadiusAxis >
                            </RadialBarChart >
                        </ChartContainer >
                    )
                }
            </CardContent >
            <CardFooter className = "flex-col gap-2 text-sm" >
                <div className = "flex items-center gap-2 leading-none font-medium" >
                   <Link href = "/dashboard/anno_scolastico/Pentamestre" >
                       <Button >View Pentamestre</Button >
                   </Link >
                </div >
            </CardFooter >
        </Card >
    )
}
