import {SignIn} from "@clerk/nextjs"

export default function Page() {
    return (
        <SignIn
            afterSignInUrl="/dashboard"  // Redirect immediato post-login
            signUpUrl="/sign-up"  // Link a signup se utente sceglie
        />
    )
}