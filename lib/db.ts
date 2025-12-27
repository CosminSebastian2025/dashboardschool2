// lib/db.ts
import {supabase} from './supabase'

// Inserisci un nuovo voto
export async function insertGrade(
    idUtente: string,
    subject: string,
    voto: number,
    note: string | null,
    data: string, // formato YYYY-MM-DD
    periodo: string
) {
    const {error} = await supabase
        .from('Voti')
        .insert({
            idUtente,
            subject,
            voto,
            note,
            data,
            periodo,
        })

    if (error) {
        console.error('Errore durante insertGrade:', error)
        throw error
    }
}

// Registra l'utente se non esiste già (chiamala all'accesso con Clerk)
export async function registerUser(idUtente: string) {
    const {data, error} = await supabase
        .from('Utenti')
        .select('id_utente')
        .eq('id_utente', idUtente)
        .maybeSingle()

    if (error && error.code !== 'PGRST116') {
        console.error('Errore registerUser:', error)
        throw error
    }

    if (!data) {
        const {error: insertError} = await supabase
            .from('Utenti')
            .insert({id_utente: idUtente})

        if (insertError) {
            console.error('Errore inserimento utente:', insertError)
            throw insertError
        }
    }
}

// Tutti i voti (filtrabili per materia)
export async function getAllGrades(subject?: string, idUtente?: string) {
    let query = supabase.from('Voti').select('*').order('data', {ascending: false}).order('periodo', {ascending: false})

    if (idUtente) query = query.eq('idUtente', idUtente)
    if (subject) query = query.eq('subject', subject)

    const {data, error} = await query

    if (error) {
        console.error('Errore getAllGrades:', error)
        throw error
    }
    return data || []
}

// Voti di un periodo specifico (trimestre, pentamestre, ecc.)
export async function getGradesByPeriod(period: string, idUtente: string) {
    const {data, error} = await supabase
        .from('Voti')
        .select('*')
        .eq('periodo', period)
        .eq('idUtente', idUtente)
        .order('data', {ascending: false})

    if (error) throw error
    return data || []
}

// Tutti i voti dell'utente (per grafici e medie)
export async function getGradesByPeriodTwo(idUtente: string) {
    const {data, error} = await supabase
        .from('Voti')
        .select('*')
        .eq('idUtente', idUtente)
        .order('data', {ascending: true})

    if (error) throw error
    return data || []
}

// Voti per materia specifica (per grafico andamento)
export async function postGradesAll(idUtente: string, subject: string) {
    const {data, error} = await supabase
        .from('Voti')
        .select('subject, voto, data, periodo, note')
        .eq('idUtente', idUtente)
        .eq('subject', subject)
        .order('data', {ascending: true})

    if (error) throw error
    return data || []
}

// Voti di un periodo (usato per medie trimestre/pentamestre)
export async function postGradesByPeriod(period: string, idUtente: string) {
    const {data, error} = await supabase
        .from('Voti')
        .select('subject, voto, data, note')
        .eq('idUtente', idUtente)
        .eq('periodo', period)
        .order('data', {ascending: true})

    if (error) throw error
    return data || []
}

// Tutti i voti dell'utente (media annuale, ecc.) – corregge il bug logico della query originale
export async function postGradesAllTwo(idUtente: string) {
    const {data, error} = await supabase
        .from('Voti')
        .select('subject, voto, data, periodo, note')
        .eq('idUtente', idUtente)
        .order('data', {ascending: true})

    if (error) throw error
    return data || []
}