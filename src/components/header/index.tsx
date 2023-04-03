import styles from './styles.module.css'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'


export function Header(){

    const {data: session, status} = useSession();

    return(
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.nav}>
                    <Link href="/">
                        <h1 className={styles.logo}>
                            Tasks <span>+</span>
                            </h1>
                    </Link>
                    {session?.user && (
                        <Link href="/dashboard" className={styles.link}>
                        My Panel
                        </Link>
                    )}
                   
                </nav>

                { status === "loading" ? (
                    <></>
                ) :  session ? (
                <button className={styles.loginButton} onClick={()=>signOut()}>
                    Hello, {session.user?.name}
                </button>

                ) : (
                <button className={styles.loginButton} onClick={()=>signIn("google")}>
                    Login
                </button>

                ) }                
                
            </section>
        </header>
    )

}