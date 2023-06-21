import { createContext, useEffect, useState } from "react";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut as signOutFirebase,
    onAuthStateChanged
} from 'firebase/auth';

const UserContext = createContext({})

const UserProvider = ({ children } : any) => {

    const auth = getAuth();
    const [couldLogin] = useState(true)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')

    useEffect(() => {
        return onAuthStateChanged(auth, listenAuth)
    }, [])

    const listenAuth = async (/* userState: any */) => {
       /*  console.log('listenAuth', userState) */
        setUser(auth.currentUser as any)
        setLoading(false)
    }



    const signIn = (email:string, password:string)=> {
        /* console.log('xxx', email, password) */
        setLoading(true)
        signInWithEmailAndPassword(auth, email, password).then((/* userCredential */) => {

        }).catch((/* error */) => {
           /* console.log('error', error) */
            setErr
            setLoading(false)
        })

    }

    const signOut = () => {
        /* console.log('sai!!!') */
        setLoading(true)

        signOutFirebase(auth)
            .then(() => {
                /* console.log("deslogado com sucesso") */
            }).catch(() => {
                /* console.log('error', error) */
                setLoading(false)
            })
    }

    return (
        <UserContext.Provider value={{ couldLogin, signIn, signOut, user, loading, err, setErr }}>
            {children}
        </UserContext.Provider>
    )
}


export { UserContext, UserProvider }