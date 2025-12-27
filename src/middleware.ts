import {clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server'

// 1. Definisci QUI solo le rotte che vuoi proteggere
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    // Aggiungi qui altre rotte private se servono.
    // NON mettere qui '/' se vuoi che la home sia pubblica.
])

export default clerkMiddleware((auth, req) => {
    // 2. Il controllo avviene qui
    if (isProtectedRoute(req)) {
        // Se la rotta è protetta, usa protect() sull'oggetto auth
        // Senza parentesi su auth, perché nel tuo caso è un oggetto
        auth.protect()
    }
})

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}