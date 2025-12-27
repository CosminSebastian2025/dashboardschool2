import path from "path";
import Database from "better-sqlite3";

// Percorso assoluto al file SQLite (scripts/nuovodb.db)
const dbPath = path.join(process.cwd(), "scripts", "nuovodb");

// Inizializza DB
const db = new Database(dbPath);

/*db.prepare(`
    CREATE TABLE IF NOT EXISTS Utenti
    (
        id_utente TEXT PRIMARY KEY
    )`
).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS Voti
    (
        idVoto   INTEGER PRIMARY KEY AUTOINCREMENT,
        idUtente TEXT,
        subject  TEXT NOT NULL,
        voto     REAL NOT NULL,
        data     TEXT NOT NULL,
        periodo  TEXT NOT NULL,
        note     TEXT,

        FOREIGN KEY (idUtente) REFERENCES Utenti (id_utente)
    )
`).run();*/

export function insertGrade(idUtente: string, subject: string, voto: number, note: string, data: string, periodo: string) {
    const stmt = db.prepare(`
        INSERT INTO Voti (idUtente, subject, voto, note, data, periodo)
        VALUES (?, ?, ?, ?, ?, ?);
    `);

    return stmt.run(idUtente, subject, voto, note, data, periodo);
}

export function getAllGrades(subject?: string, idUtente?: string) {
    if (subject) {
        return db.prepare("SELECT * FROM Voti WHERE subject = ? AND Voti.idUtente = ? ORDER BY data DESC, periodo DESC").all(subject, idUtente);
    }
    return db.prepare("SELECT * FROM Voti ORDER BY data DESC, periodo DESC").all();
}

export function getGradesByPeriod(period: string, idUtente?: string) {
    return db.prepare("SELECT * FROM Voti WHERE periodo = ? AND Voti.idUtente = ?").all(period, idUtente);

    //return db.prepare("SELECT * FROM Voti").all();

}

export function getGradesByPeriodTwo(idUtente?: string) {
    return db.prepare("SELECT * FROM Voti WHERE Voti.idUtente= ?").all(idUtente);

    //return db.prepare("SELECT * FROM Voti").all();
}

export function userExists(idUtente: string) {
    const stmt = db.prepare("SELECT * FROM Utenti WHERE id_utente = ?");
    const result = stmt.all(idUtente);

    // Se per qualche motivo result è undefined, restituisci false
    return result.length > 0;
}

export function registerUser(idUtente: string) {
    db.prepare("INSERT INTO Utenti (id_utente) VALUES (?)").run(idUtente);
}

export function postGradesAll(idUtente?: string, subject?: string) {
    const stmt = db.prepare(
        "SELECT * FROM Voti WHERE Voti.idUtente = ? AND subject = ? ORDER BY data ASC"
    ).all(idUtente, subject);

    return stmt;
}

export function postGradesByPeriod(period: string, idUtente?: string) {
    const stmt = db.prepare(
        "SELECT subject, voto, data, note FROM Voti WHERE idUtente = ? AND periodo = ? ORDER BY data ASC"
    ).all(idUtente, period);

    return stmt;
}

export function postGradesAllTwo(idUtente?: string) {
    const stmt = db.prepare(
        "SELECT subject, voto, data, periodo, note FROM Voti WHERE Voti.idUtente = ? AND (periodo = 'trimestre' AND periodo= 'pentamestre') ORDER BY data ASC"
    ).all(idUtente);

    return stmt;
}