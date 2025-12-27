import React from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import AddGradeForm from "./AddGradeForm"

type AddGradePageProps = {
    params: { subject: string }
}

export async function generateStaticParams() {
    const subjects = [
        'Matematica',
        'Storia',
        'Gestione Progetto',
        'Sistemi e Reti',
        'Italiano',
        'Informatica',
        'Inglese',
        'Educazione Fisica',
        'TPSIT',
        'Religione'
    ]
    return subjects.map((subject) => ({
        subject: encodeURIComponent(subject)
    }));
}

export default async function AddGradePage({params}: AddGradePageProps) {
    const {subject: encodedSubject} = params;

    // Decodifica il subject (es. "Gestione%20Progetto" → "Gestione Progetto")
    const subject = decodeURIComponent(encodedSubject);

    // Verifica se la materia esiste nella lista (protezione contro URL sbagliati)
    const isValidSubject = subject.includes(subject);

    return (
        <div className = "container mx-auto p-6 max-w-2xl" >
            {
                isValidSubject ? (
                    <Card className = "shadow-lg" >
                    <CardHeader >
                        <CardTitle className = "text-2xl font-bold text-center" >
                          Aggiungi voto - {subject}
                        </CardTitle >
                    </CardHeader >
                    <CardContent >
                        <AddGradeForm subject = {subject} />
                    </CardContent >
                    </Card >
                ) : (
                    <Card className = "shadow-lg" >

                        <CardHeader >

                            <CardTitle className = "text-xl text-center text-red-600" >
                                Materia non trovata
                            </CardTitle >
                        </CardHeader >
                        <CardContent className = "text-center" >
                            <p className = "text-muted-foreground" >
                                La materia "{subject}" non è valida o non esiste.
                            </p >
                            <p className = "mt-4 text-sm" >
                                Torna alla <a href = "/dashboard"
                                              className = "text-blue-600 underline" >dashboard</a > per selezionare una materia.
                            </p >
                        </CardContent >
                    </Card >
                )
            }
        </div >
    );
}
