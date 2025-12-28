// src/app/api/grades/route.ts  (o dove si trova)
import {NextResponse} from "next/server";
import {
    getAllGrades,
    getGradesByPeriod,
    getGradesByPeriodTwo,
    insertGrade,
    postGradesAll,
    postGradesAllTwo,
    registerUser,
} from "../../../../lib/db"; // <-- assicurati che punti al nuovo db.ts con Supabase

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url);
        const idUtente = searchParams.get("id_utente");
        const action = searchParams.get("action");
        const subject = searchParams.get("subject") || undefined;

        if (!idUtente) {
            return NextResponse.json({error: "id_utente mancante"}, {status: 400});
        }

        // Registra l'utente se non esiste (ora è async!)
        await registerUser(idUtente);

        if (action === "voti" && idUtente) {
            const rows = await getAllGrades(subject, idUtente);
            return NextResponse.json({grades: rows});
        } else if (action === "trimestre" && idUtente) {
            const rows = await getGradesByPeriod("trimestre", idUtente);
            return NextResponse.json({grades: rows});
        } else if (action === "trimestrePentamestre" && idUtente) {
            const rows = await getGradesByPeriodTwo(idUtente);
            return NextResponse.json({grades: rows});
        } else if (action === "pentamestre" && idUtente) {
            const rows = await getGradesByPeriod("pentamestre", idUtente);
            return NextResponse.json({grades: rows});
        } else if (action === "fetchGrades" && idUtente && subject) {
            const grades = await postGradesAll(idUtente, subject);
            return NextResponse.json({grades});
        } else if (action === "allGrades" && idUtente) {
            const grades = await postGradesAllTwo(idUtente);
            return NextResponse.json({grades});
        }

        return NextResponse.json({message: "No valid action specified"}, {status: 400});
    } catch (error: any) {
        console.error("DB GET error:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {idUtente, subject, voto, note, data, periodo} = body;

        if (!idUtente || !subject || !voto || !data || !periodo) {
            return NextResponse.json({error: "Campi obbligatori mancanti"}, {status: 400});
        }

        // Registra l'utente (se è la prima volta)
        await registerUser(idUtente);

        // Inserisci il voto
        await insertGrade(idUtente, subject, voto, note || null, data, periodo);

        return NextResponse.json({success: true});
    } catch (error: any) {
        console.error("DB POST error:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}