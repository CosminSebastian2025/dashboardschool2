import {NextResponse} from "next/server";
import {
    getAllGrades,
    getGradesByPeriod,
    getGradesByPeriodTwo,
    insertGrade,
    postGradesAll,
    postGradesAllTwo,
    postGradesByPeriod,
    registerUser,
    userExists
} from "../../../../lib/db";


export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url);
        const idUtente = searchParams.get("id_utente"); // ID utente fisso per ora, da sostituire con autenticazione
        const action = searchParams.get("action");
        const subject = searchParams.get("subject") || undefined;

        // 🔹 Se l’utente non esiste nel DB, lo registriamo
        if (!idUtente) {
            return NextResponse.json({error: "id_utente mancante"}, {status: 400});
        }

        const alreadyExists = userExists(idUtente);

        console.log("elemento trovati:" + alreadyExists);
        if (!alreadyExists) {
            registerUser(idUtente);
        }

        if (action === 'voti' && idUtente) {
            const {searchParams} = new URL(request.url);
            const subject = searchParams.get("subject") || undefined;

            const rows = getAllGrades(subject, idUtente);
            return NextResponse.json({grades: rows});
        } else if (action === 'trimestre' && idUtente) {
            const rows = getGradesByPeriod("trimestre", idUtente);
            return NextResponse.json({grades: rows});
        } else if (action === 'trimestrePentamestre' && idUtente) {
            const rows = getGradesByPeriodTwo(idUtente);
            return NextResponse.json({grades: rows});
        } else if (action === 'pentamestre' && idUtente) {
            const rows = getGradesByPeriod("pentamestre", idUtente);
            return NextResponse.json({grades: rows});
        } else if (action === 'fetchGrades' && idUtente) {
            const postGrades = postGradesAll(idUtente, subject);
            return NextResponse.json({grades: postGrades});
        } else if (action === 'allGrades' && idUtente) {
            const postAllGrades = postGradesAllTwo(idUtente);
            return NextResponse.json({grades: postAllGrades});
        } else {
            console.log('No action specified');
            return NextResponse.json({message: "No action specified"}, {status: 400});
        }


    } catch (error: any) {
        console.error("DB GET error:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }

}

export async function POST(request: Request) {
    try {
        const {searchParams} = new URL(request.url);
        const action = searchParams.get("action");
        const id_Utente = searchParams.get("id_utente"); // ID utente fisso per ora, da sostituire con autenticazione


        const {idUtente, subject, voto, note, data, periodo} = await request.json();

        if (!subject || !voto || !data || !periodo) {
            return NextResponse.json({error: "Campi obbligatori mancanti"}, {status: 400});
        }

        console.log("esiste " + userExists(idUtente));
        if (userExists(idUtente))
            insertGrade(idUtente, subject, voto, note, data, periodo);
        else
            registerUser(idUtente);


        if (action === 'pentamestre' && id_Utente) {
            const rows = postGradesByPeriod("pentamestre", idUtente);
            return NextResponse.json({grades: rows});
        } else if (action === 'trimestre' && id_Utente) {
            const rows = postGradesByPeriod("trimestre", idUtente);
            return NextResponse.json({grades: rows});
        }

        return NextResponse.json({success: true});
    } catch (error: any) {
        console.error("DB POST error:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}

