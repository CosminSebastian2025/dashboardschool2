'use client';
import React, {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {ArrowLeft} from "lucide-react"
import {useUser} from "@clerk/nextjs";

type Props = {
    subject: string
}

export default function AddGradeForm({subject}: Props) {
    const {user} = useUser();

    const router = useRouter()
    const today = new Date()
    const pad2 = (n: number) => String(n).padStart(2, '0')
    const [formData, setFormData] = useState({
        voto: '',
        note: '',
        giorno: pad2(today.getDate()),
        mese: pad2(today.getMonth() + 1),
        anno: String(today.getFullYear()),
        periodo: 'trimestre'
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        // Validate voto
        if (!formData.voto) {
            newErrors.voto = 'Il voto è obbligatorio'
        } else {
            const voto = parseFloat(formData.voto)
            if (isNaN(voto) || voto < 1 || voto > 10) {
                newErrors.voto = 'Il voto deve essere un numero tra 1 e 10'
            }
        }

        // Validate date
        const giorno = parseInt(formData.giorno)
        const mese = parseInt(formData.mese)
        const anno = parseInt(formData.anno)

        if (giorno < 1 || giorno > 31) {
            newErrors.giorno = 'Giorno non valido (1-31)'
        }
        if (mese < 1 || mese > 12) {
            newErrors.mese = 'Mese non valido (1-12)'
        }
        if (anno < 1900 || anno > 2100) {
            newErrors.anno = 'Anno non valido'
        }

        // Check if date is valid
        const composedDate = `${formData.anno}-${formData.mese}-${formData.giorno}`
        const inputDate = new Date(composedDate)
        if (isNaN(inputDate.getTime())) {
            newErrors.data = 'Data non valida'
        } else if (inputDate > new Date()) {
            newErrors.data = 'Non puoi inserire voti per date future'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)
        setErrors({})

        try {
            const composedDate = `${formData.anno}-${formData.mese}-${formData.giorno}`

            // POST /api/grades
            // - Metodo: POST verso l'endpoint relativo `/api/grades` dell'app Next.js.
            // - Headers: `Content-Type: application/json` per indicare che il body è JSON.
            // - Body: JSON.stringify con questi campi:
            //     * subject: la materia (dal prop `subject`)
            //     * voto: numero (parseFloat di formData.voto)
            //     * note: stringa opzionale
            //     * data: data composta in formato YYYY-MM-DD
            //     * periodo: 'trimestre' | 'pentamestre'
            // - Scopo: creare/salvare un nuovo voto nel DB tramite l'API server.
            // - Nota importante: essendo un URL relativo, la richiesta viene inviata allo stesso origin
            //   dell'app (es. http://localhost:3000 in sviluppo). Non posso eseguirla da qui perché
            //   il server Next.js non è avviato nell'ambiente remoto dove sto operando. Per testarla
            //   localmente, avvia `npm run dev` e poi invia la stessa richiesta (es. con curl o Postman).
            const response = await fetch('/api/grades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idUtente: user?.id, // ID utente fisso per ora, da sostituire con autenticazione
                    subject,
                    voto: parseFloat(formData.voto),
                    note: formData.note,
                    data: composedDate,
                    periodo: formData.periodo
                })
            })

            // Legge la risposta JSON; ci si aspetta un oggetto con `message` in caso di successo
            // o `error` in caso di errore.
            const result = await response.json()

            if (response.ok) {
                // In caso di successo: notifica e reindirizza alla dashboard
                alert(result.message || 'Voto salvato con successo!')
                router.push('/dashboard')
            } else {
                // In caso di errore (status 4xx/5xx): mostra l'errore restituito dall'API
                setErrors({submit: result.error || 'Errore nel salvare il voto'})
            }
        } catch (error) {
            console.error('Error saving grade:', error)
            setErrors({submit: 'Errore di connessione. Riprova più tardi.'})
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({...prev, [field]: ''}))
        }
    }

    return (
        <form onSubmit = {handleSubmit}
              className = "space-y-6" >
            {/* Mostra la materia in alto, non modificabile */}
            <div className = "space-y-2" >
                <Label htmlFor = "subject" >Materia</Label >
                <Input id = "subject"
                       value = {subject}
                       disabled />
            </div >

            <h1 >{user?.id}</h1 >
            <div className = "flex items-center gap-4 mb-6" >
                <Button
                    variant = "outline"
                    size = "sm"
                    onClick = {() => router.push('/dashboard')}
                    className = "flex items-center gap-2"
                    type = "button"
                >
                    <ArrowLeft className = "h-4 w-4" />
                    Torna alla Dashboard
                </Button >
                <h2 className = "text-xl font-semibold" >Aggiungi Voto</h2 >
            </div >

            <div className = "grid grid-cols-2 gap-4" >
                <div className = "space-y-2" >
                    <Label htmlFor = "voto" >Voto *</Label >
                    <Input
                        id = "voto"
                        type = "number"
                        min = "1"
                        max = "10"
                        step = "0.1"
                        value = {formData.voto}
                        onChange = {(e) => handleInputChange('voto', e.target.value)}
                        required
                        placeholder = "Es. 7.5"
                        className = {errors.voto ? 'border-red-500' : ''}
                    />
                    {errors.voto && <p className = "text-red-500 text-sm" >{errors.voto}</p >}
                </div >
                <div className = "space-y-2" >
                    <Label >Data (Giorno / Mese / Anno) *</Label >
                    <div className = "grid grid-cols-3 gap-2" >
                        <div >
                            <Input
                                id = "giorno"
                                type = "number"
                                min = "1"
                                max = "31"
                                value = {formData.giorno}
                                onChange = {(e) => handleInputChange('giorno', (Number(e.target.value) || 0).toString().padStart(2, '0'))}
                                required
                                placeholder = "GG"
                                className = {errors.giorno ? 'border-red-500' : ''}
                            />
                            {errors.giorno && <p className = "text-red-500 text-xs mt-1" >{errors.giorno}</p >}
                        </div >
                        <div >
                            <Input
                                id = "mese"
                                type = "number"
                                min = "1"
                                max = "12"
                                value = {formData.mese}
                                onChange = {(e) => handleInputChange('mese', (Number(e.target.value) || 0).toString().padStart(2, '0'))}
                                required
                                placeholder = "MM"
                                className = {errors.mese ? 'border-red-500' : ''}
                            />
                            {errors.mese && <p className = "text-red-500 text-xs mt-1" >{errors.mese}</p >}
                        </div >
                        <div >
                            <Input
                                id = "anno"
                                type = "number"
                                min = "1900"
                                max = "2100"
                                value = {formData.anno}
                                onChange = {(e) => handleInputChange('anno', e.target.value)}
                                required
                                placeholder = "AAAA"
                                className = {errors.anno ? 'border-red-500' : ''}
                            />
                            {errors.anno && <p className = "text-red-500 text-xs mt-1" >{errors.anno}</p >}
                        </div >
                    </div >
                    {errors.data && <p className = "text-red-500 text-sm" >{errors.data}</p >}
                </div >
            </div >

            <div className = "space-y-2" >
                <Label htmlFor = "periodo" >Periodo</Label >
                <Select
                    value = {formData.periodo}
                    onValueChange = {(value) => handleInputChange('periodo', value)}
                >
                    <SelectTrigger >
                        <SelectValue placeholder = "Seleziona periodo" />
                    </SelectTrigger >
                    <SelectContent >
                        <SelectItem value = "trimestre" >Trimestre</SelectItem >
                        <SelectItem value = "pentamestre" >Pentamestre</SelectItem >
                    </SelectContent >
                </Select >
            </div >

            <div className = "space-y-2" >
                <Label htmlFor = "note" >Note (opzionale)</Label >
                <Textarea
                    id = "note"
                    value = {formData.note}
                    onChange = {(e) => handleInputChange('note', e.target.value)}
                    placeholder = "Descrivi cosa hai fatto, l'argomento, il tipo di verifica..."
                    rows = {4}
                />
            </div >

            {errors.submit && (
                <div className = "bg-red-50 border border-red-200 rounded-md p-3" >
                    <p className = "text-red-600 text-sm" >{errors.submit}</p >
                </div >
            )}

            <div className = "flex gap-4" >
                <Button
                    type = "submit"
                    disabled = {loading || !formData.voto}
                    className = "flex-1"
                >
                    {loading ? 'Salvando...' : 'Salva Voto'}
                </Button >
                <Button
                    type = "button"
                    variant = "outline"
                    onClick = {() => router.push('/dashboard')}
                    disabled = {loading}
                >
                    Annulla
                </Button >
            </div >
        </form >
    )
}
